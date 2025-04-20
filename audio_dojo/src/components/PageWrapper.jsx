// components/PageWrapper.jsx
import { motion } from 'framer-motion';

export default function PageWrapper({ children, className = "" }) {
  return (
    <motion.div
      className={className} // חשוב
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
