'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Home, Plus } from 'iconoir-react';
import { usePathname, useRouter } from 'next/navigation';

export const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const value = pathname.startsWith('/competitions/new') ? 'new' : 'home';

  const handleChange = (val: string) => {
    if (val === 'home') router.push('/home');
    if (val === 'new') router.push('/competitions/new');
  };

  return (
    <Tabs value={value} onValueChange={handleChange}>
      <TabItem value="home" icon={<Home />} label="Home" />
      <TabItem value="new" icon={<Plus />} label="New" />
    </Tabs>
  );
};
