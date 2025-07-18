'use client';

import type { User } from 'next-auth';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from './ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SidebarPhrase({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/phrase'}>
              <Link
                href="/phrase?from=russian&to=english&topic=greetings&count=10"
                onClick={() => setOpenMobile(false)}
              >
                <span>Phrases</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
