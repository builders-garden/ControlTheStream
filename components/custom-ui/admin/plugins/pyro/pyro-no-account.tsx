import { ExternalLink, Flame } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export const PyroNoAccount = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-center items-center w-full py-16 gap-6">
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex justify-center items-center size-20 rounded-full bg-orange-500/10">
          <Flame className="size-10 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-center">
          No Pyro Account Found
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Create a Pyro page to enable sponsor leaderboards and engage your
          community with burn-to-advertise mechanics.
        </p>
      </div>

      <Link
        href="https://www.pyro.buzz"
        target="_blank"
        rel="noopener noreferrer">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
          <Flame className="size-5" />
          Create Your Pyro Page
          <ExternalLink className="size-4" />
        </motion.button>
      </Link>
    </motion.div>
  );
};
