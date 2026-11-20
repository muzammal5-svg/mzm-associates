import { NextResponse } from "next/server";

export async function GET() {
  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.mzm.dailydiary",
        sha256_cert_fingerprints: ["REPLACE_WITH_SHA256_FROM_PWABUILDER"],
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
