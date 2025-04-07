"use client";
import React, { Suspense } from "react";
import Video from "@/app/components/video"; // أو المسار الصحيح

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Video />
    </Suspense>
  );
};

export default Page;
