"use client";

import React, { Suspense } from 'react';
import CommunityPage from '@/app/components/community/communityPage';

const Page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading Community Page...</div>}>
        <CommunityPage />
      </Suspense>
    </div>
  );
};

export default Page;
