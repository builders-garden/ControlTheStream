import { motion } from "motion/react";
import Image from "next/image";

interface LandingContentProps {
  signInWithBase: () => void;
}

export const LandingContent = ({ signInWithBase }: LandingContentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex justify-center items-center w-full min-h-screen p-4 md:p-10 bg-[#121314]">
      <div className="flex flex-col md:flex-row items-center justify-between w-full h-full px-4 md:px-20 py-6 md:py-5 gap-8 md:gap-20 bg-background rounded-[18px] md:rounded-[25px]">
        <div className="flex flex-col items-start justify-center w-full md:w-[40%] gap-6 md:gap-10 shrink-0">
          <div className="flex justify-start items-center gap-3">
            <Image
              src="/images/cts_logo.svg"
              alt="The Control The Stream logo"
              width={56}
              height={56}
              priority
            />
            <h1 className="text-[28px] md:text-[40px] font-bold">
              ControlTheStream
            </h1>
          </div>

          <p className="text-3xl md:text-6xl text-start leading-tight">
            Onchain overlay for your livestream.
          </p>

          <p className="text-base md:text-lg text-white/90 text-start leading-relaxed">
            Viewers shape what happens on stream through tips, trades, votes and
            more onchain interactions.
          </p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex justify-center items-center gap-3 bg-foreground text-background w-full md:w-fit py-3 px-5 rounded-[12px] text-base md:text-lg font-extrabold cursor-pointer hover:bg-foreground/90"
            onClick={signInWithBase}>
            <div className="size-5 md:size-6 bg-blue-600" />
            Sign in with Base
          </motion.button>
        </div>

        <div className="relative flex justify-center items-center w-full mt-8 md:mt-0">
          <Image
            src="/images/hero.svg"
            alt="The Control The Stream hero image"
            width={900}
            height={900}
            className="object-contain max-h-[360px] md:max-h-none"
          />
          <Image
            src="/images/overlay_popup.gif"
            alt="The Control The Stream overlay popup example"
            width={120}
            height={120}
            className="object-contain absolute -left-2 top-8 md:-left-10 md:top-12 pointer-events-none"
          />
        </div>
      </div>
    </motion.div>
  );
};
