import { motion } from "framer-motion";

function WelcomeAnimate() {
  const text = "Welcome".split("");

  return (
    <div className="welcomeAnim">
      {text.map((el, i) => (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.60,
            delay: i / 20,
          }}
          key={i}
        >
          {el}{""}
        </motion.span>
      ))}
    </div>
  );
}

export default WelcomeAnimate;
