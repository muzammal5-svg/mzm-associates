# Mobile Release Guide (MZM & Associates)

This document covers the Android release workflow: Firebase/FCM setup, signing a
release AAB, Play Console submission, and required policy items (privacy policy
and in-app account deletion).

## 1. Firebase / FCM setup (Android push notifications)

Native Android push uses Firebase Cloud Messaging (FCM) via the Capacitor
`@capacitor/push-notifications` plugin. The Edge Function `send-push` delivers
to FCM device tokens stored in `public.device_tokens`.

### 1.1 Create the Firebase project

1. Go to https://console.firebase.google.com/.
2. Add project → name it "mzm-cms" → continue (Google Analytics optional).
3. Once created, click the **Android** icon (🤖) to register an Android app.
4. Package name: `com.mzmassociates.cms`
   App nickname: `MZM & Associates`
   Debug signing certificate SHA-1: obtain from your keystore (optional for
   debug; required for production).
5. Click **Register app**.

### 1.2 Download `google-services.json`

- On the next screen, click **Download google-services.json**.
- Place it at `web/android/app/google-services.json`.
- **Never commit this file to version control.** Add it to `.gitignore`.

### 1.3 Add Firebase config to `.env.local`

Add the following values (from Firebase Project settings → General → Your apps):

```
NEXT_PUBLIC_FIREBASE_API_KEY=<apiKey>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<projectId>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<projectId>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<senderId>
NEXT_PUBLIC_FIREBASE_APP_ID=<appId:...>
```

### 1.4 FCM server key for the Edge Function

The `send-push` Edge Function calls the FCM HTTP v1 API using a Google service
account. Generate a service account key:

1. Firebase Console → Project Settings → Service accounts.
2. Click **Generate new private key** → downloads `firebase-adminsdk-*.json`.
3. Set the JSON contents as Edge Function secret `FIREBASE_SERVICE_ACCOUNT` and
   `FIREBASE_PROJECT_ID` (Supabase Dashboard → Edge Functions → send-push →
   Secrets).

## 2. Signing a release AAB

### 2.1 Create an upload keystore

```bash
keytool -genkeypair -v -keystore mzm-upload.keystore -alias mzm-key \
  -keyalg RSA -keysize 2048 -validity 10000 -storepass <store-password> \
  -keypass <key-password> -dname "CN=MZM & Associates, O=MZM, C=PK"
```

- Store `mzm-upload.keystore` securely (never commit it).
- Add to `web/android/keystores/` (gitignored).

### 2.2 Configure Gradle signing

In `web/android/app/build.gradle.kts` (or `build.gradle`):

```kotlin
android {
  signingConfigs {
    create("release") {
      storeFile = file(System.getenv("RELEASE_STORE_FILE") ?: "keystores/mzm-upload.keystore")
      storePassword = System.getenv("RELEASE_STORE_PASSWORD") ?: ""
      keyAlias = System.getenv("RELEASE_KEY_ALIAS") ?: "mzm-key"
      keyPassword = System.getenv("RELEASE_KEY_PASSWORD") ?: ""
    }
  }
  buildTypes {
    release {
      signingConfig = signingConfigs.getByName("release")
      minifyEnabled true
      proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
    }
  }
}
```

### 2.3 Build the release AAB

```bash
cd web
npm run build                # Next.js static export → out/
npx cap copy android         # Copy web assets
npx cap sync android         # Sync plugins
cd android
.\gradlew bundleRelease      # Produces app-release.aab
```

Output: `web/android/app/build/outputs/bundle/release/app-release.aab`

For a debug APK (development only):

```bash
cd web/android
.\gradlew assembleDebug
```

Output: `web/android/app/build/outputs/apk/debug/app-debug.apk`

## 3. Play Console checklist

Before uploading to Google Play Console:

- [ ] Release AAB built and signed with the upload keystore.
- [ ] `google-services.json` placed in `web/android/app/`.
- [ ] App signing: opt into **Google Play App Signing** (recommended; Google
  manages your production signing key, you keep the upload key).
- [ ] Content rating questionnaire completed.
- [ ] Target Android API level ≥ 34 (Android 14).
- [ ] Privacy Policy URL provided (see §4).
- [ ] In-app account deletion mechanism implemented (see §5).
- [ ] Screenshots and feature graphic uploaded.
- [ ] App description, contact details, and privacy policy link added.

### Play Console → App integrity / Data safety

Declare in the **Data safety** section:
- User data collected: name, email, phone, case/hearing data, documents.
- Purpose: case management, hearing reminders, notifications.
- Data is not shared with third parties.
- Encryption in transit (HTTPS/TLS to Supabase).
- Account deletion available in-app (see §5).

## 4. Privacy Policy

A public Privacy Policy URL is required by Google Play. Host it (e.g. at
`https://mzm.pk/privacy`) and link it in:
- Play Console → Store presence → App content → Privacy Policy.
- The app's Settings / About screen.

The policy must disclose:
- What personal data is collected (name, CNIC, phone, email, case details,
  documents, hearing dates).
- How data is used (case management, reminders, push notifications).
- Who data is shared with (Supabase as data processor; no third-party sale).
- Data retention and deletion rights.
- Contact for privacy queries.

## 5. In-app account deletion

Google Play requires apps with accounts to offer in-app account deletion.

### Implementation

In `web/app/settings/page.tsx` (or the profile/settings area), add:

```tsx
async function deleteAccount() {
  const confirmed = window.confirm(
    "Deleting your account will permanently remove your profile, cases, " +
    "hearings, documents, and notifications. This cannot be undone. Continue?"
  );
  if (!confirmed) return;
  const { error } = await supabase.functions.invoke("delete-account");
  if (error) throw error;
  await supabase.auth.signOut();
}
```

### Edge Function `delete-account`

Create `supabase/functions/delete-account/index.ts` that:
1. Verifies the caller's JWT.
2. Deletes the user's `device_tokens`, `push_subscriptions`, `notifications`,
   `reminders`, `documents` (files from storage), `cases`, `activity_log`, and
   `profile` row.
3. Calls `supabase.auth.admin.deleteUser(uid)` (service role).
4. Returns success.

The user can then request deletion of their Firebase/Google account separately
via the Play Console account deletion URL, which you provide in Play Console.

## 6. Commands summary

```bash
# Development
npm run build            # web static export
npx cap copy android     # sync web → android
npx cap sync android     # sync plugins

# Release
cd web/android
.\gradlew bundleRelease  # AAB for Play Console

# Debug APK
.\gradlew assembleDebug  # APK for sideloading
```
