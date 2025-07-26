'use client';

import type { User } from 'next-auth';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { SidebarPhrase } from './sidebar-phrase';

export function AppSidebar({ user }: { user: User | undefined }) {
  // const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center py-2">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <div className="px-2 cursor-pointer">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={48}
                  height={19}
                  className="object-contain transition-all duration-200 hover:brightness-0 hover:saturate-100 hover:[filter:invert(26%)_sepia(89%)_saturate(1583%)_hue-rotate(95deg)_brightness(70%)_contrast(120%)]"
                />
              </div>
            </Link>
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip> */}
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <SidebarHistory user={user} /> */}
        <SidebarPhrase user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
