import { motion } from "framer-motion";

const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm overflow-hidden"
  >
    <div className="flex items-center gap-2">
      <motion.div
        animate={{
          background: [
            "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
            "linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)"
          ]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="h-5 w-5 bg-slate-200 rounded-full"
      />
      <motion.div
        animate={{
          background: [
            "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
            "linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)"
          ]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1
        }}
        className="h-3 bg-slate-200 rounded w-16"
      />
    </div>
    <motion.div
      animate={{
        background: [
          "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
          "linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)"
        ]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.2
      }}
      className="h-4 bg-slate-200 rounded w-3/4"
    />
    <motion.div
      animate={{
        background: [
          "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
          "linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)"
        ]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.3
      }}
      className="h-3 bg-slate-100 rounded w-full"
    />
    <motion.div
      animate={{
        background: [
          "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
          "linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)"
        ]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.4
      }}
      className="h-3 bg-slate-100 rounded w-5/6"
    />
  </motion.div>
);

export default SkeletonCard;