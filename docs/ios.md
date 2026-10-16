# iOS Platform (MZM & Associates)

## Status

The iOS Capacitor platform has been added to the project:

```
web/ios/        ← Xcode project (Capacitor native wrapper)
```

It was created with `npx cap add ios` and synced with `npx cap sync ios`.

## Requirements (cannot be satisfied on Windows)

Building the iOS app requires:

1. **macOS** — Xcode only runs on macOS.
2. **Xcode** — Install from the Mac App Store (≥ Xcode 15 recommended).
3. **Apple Developer account** — Required to sign and distribute on the App Store
   ($99/year). A free Apple ID can be used for device testing via sideloading,
   but not for App Store submission.
4. **CocoaPods** — `sudo gem install cocoapods` (needed for native plugin
   dependencies).

## Build steps (on a Mac)

```bash
cd web
npm run build              # Next.js static export → out/
npx cap copy ios           # Copy web assets into the Xcode project
npx cap sync ios           # Sync Capacitor plugins and CocoaPods
npx cap open ios           # Open in Xcode
```

Then in Xcode:
1. Select your development team (Signing & Capabilities).
2. Set the Bundle Identifier to `com.mzmassociates.cms`.
3. Choose a device or simulator and press Run.

## Push notifications on iOS

- Native push uses `@capacitor/push-notifications` with APNs (Apple Push
  Notification service), configured through the Apple Developer portal.
- The web build also supports VAPID Web Push via the browser/PWA path
  (see docs/audit-report.md and `web/lib/push.ts`).

## Notes

- Do not attempt `npx cap open ios` or `xcodebuild` on this Windows machine.
- The `web/ios/` folder is checked in so it can be opened on a Mac.
- Re-run `npx cap sync ios` whenever web code or plugins change.
