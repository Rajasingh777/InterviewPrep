import { BsLightningChargeFill } from "react-icons/bs";
import { ImSpinner8 } from "react-icons/im";
import { TbBulb } from "react-icons/tb";
import { motion } from "framer-motion";

// Placeholder view shown when a session has no generated questions yet.
const EmptyState = ({ onGenerate, generating }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center py-20 gap-6 text-center"
  >
    {/* Decorative animated icon to make the empty state feel lively */}
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="relative"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-200 flex items-center justify-center shadow-lg">
        <TbBulb className="w-8 h-8 text-orange-500" />
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full"></div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-slate-800 font-bold text-xl mb-2">
        Ready to Start Learning?
      </h3>
      <p className="text-slate-500 text-base max-w-md leading-relaxed">
        Generate personalized AI-powered interview questions tailored to your
        role and experience level.
      </p>
    </motion.div>

    {/* Primary action to kick off generation from empty state */}
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onGenerate}
      disabled={generating}
      className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      {generating ? (
        <>
          <ImSpinner8 className="animate-spin w-5 h-5" />
          <span>Generating Questions...</span>
        </>
      ) : (
        <>
          <BsLightningChargeFill className="w-5 h-5" />
          <span>Generate Questions</span>
        </>
      )}
    </motion.button>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex items-center gap-2 text-sm text-slate-400"
    >
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span>Powered by AI • Instant Generation</span>
    </motion.div>
  </motion.div>
);

export default EmptyState;
