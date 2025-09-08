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
import { LanguageSelect } from '@/components/ui/language-select';
import { useUserPreferences } from '@/hooks/use-user-preferences';

export const Greeting = () => {
  const { prefs, setActiveLanguagePair } = useUserPreferences();

  const from = prefs?.from || '';
  const to = prefs?.to || '';

  const handleFromChange = async (value: string) => {
    await setActiveLanguagePair({ from: value, to: to || value });
  };

  const handleToChange = async (value: string) => {
    await setActiveLanguagePair({ from: from || value, to: value });
  };

  return (
    <>
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
      </header>
      <main
        key="overview"
        className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
      >
        {/* Active language pair controls */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium">From</div>
            <LanguageSelect
              value={from}
              onValueChange={handleFromChange}
              placeholder="Select"
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">To</div>
            <LanguageSelect
              value={to}
              onValueChange={handleToChange}
              placeholder="Select"
            />
          </div>
        </div>
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
          <Link href="/phrases">
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
