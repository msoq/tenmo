'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { SidebarToggle } from '@/components/sidebar-toggle';

export const Greeting = () => {
  return (
    <>
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
      </header>
      <main
        key="overview"
        className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-semibold"
        >
          Hello there!
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.6 }}
          className="text-base text-gray-600 dark:text-gray-400 mt-2"
        >
          Welcome to your personalized AI-powered language learning platform
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Link href="/phrase">
            <Card className="hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer w-72">
              <CardHeader className="p-4">
                <CardTitle className="text-base">
                  Master grammar through practice
                </CardTitle>
                <CardDescription className="text-xs">
                  Personalized AI feedback adapted to your mistakes, skills, and
                  interests
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </motion.div>
      </main>
    </>
  );
};
