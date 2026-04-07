import { BsLightningChargeFill } from "react-icons/bs";
import { ImSpinner8 } from "react-icons/im";
import { motion } from "framer-motion";

// Reusable CTA button used to trigger AI question generation.
const GenerateButton = ({ onClick, generating, loading, cooldown = 0 }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={generating || loading || cooldown > 0}
    className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
  >
    {/* Icon changes based on current generation/cooldown state */}
    {generating ? (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <ImSpinner8 className="w-4 h-4" />
      </motion.div>
    ) : cooldown > 0 ? (
      <ImSpinner8 className="w-4 h-4" />
    ) : (
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <BsLightningChargeFill className="w-4 h-4" />
      </motion.div>
    )}
    {/* Button label mirrors current action state */}
    <span>
      {generating
        ? "Generating Questions..."
        : cooldown > 0
          ? `Retry in ${cooldown}s`
          : "Generate Questions"}
    </span>
  </motion.button>
);

export default GenerateButton;
