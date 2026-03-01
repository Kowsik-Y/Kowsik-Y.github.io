import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Profile from "@/models/Profile";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  await dbConnect();
  // .lean() returns a plain MongoDB object so Mongoose does NOT apply schema
  // defaults to existing documents — new optional fields absent from the DB
  // come back as undefined rather than "", letting the admin UI fall back to
  // its own DEFAULTS for pre-population.
  const profile = await Profile.findOneAndUpdate(
    { _key: "main" },
    { $setOnInsert: { _key: "main" } },
    { upsert: true, returnDocument: "after" }
  ).lean();
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;
  await dbConnect();
  const body = await req.json();
  // Strip _key and _id from body so they can't be overwritten
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _key, _id, __v, ...data } = body;
  const profile = await Profile.findOneAndUpdate(
    { _key: "main" },
    { $set: data },
    { upsert: true, returnDocument: "after" }
  );
  return NextResponse.json(profile);
}
