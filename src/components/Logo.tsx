import { motion } from "framer-motion";
import { Train } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Logo = ({ size = "md", className = "" }: LogoProps) => {
  const sizes = {
    sm: { icon: 24, text: "text-xl" },
    md: { icon: 32, text: "text-3xl" },
    lg: { icon: 48, text: "text-5xl" }
  };

  const currentSize = sizes[size];

  return (
    <motion.div
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        animate={{
          x: [0, 5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Train 
          size={currentSize.icon} 
          className="text-primary"
          strokeWidth={2.5}
        />
      </motion.div>
      
      <div className="flex items-center overflow-hidden">
        <motion.span
          className={`font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent ${currentSize.text}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Rail
        </motion.span>
        <motion.span
          className={`font-bold text-foreground ${currentSize.text}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Go
        </motion.span>
      </div>
    </motion.div>
  );
};
