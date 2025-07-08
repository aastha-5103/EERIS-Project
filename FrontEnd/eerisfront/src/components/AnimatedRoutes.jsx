import { Outlet, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const defaultVariants = {
  initial: { opacity: 0, x: -100 },    // come in from left
  animate: { opacity: 1, x: 0 },        // arrive centered
  exit: { opacity: 0, x: 0 },           // fade out without moving
};

const loginVariants = {
  initial :{ opacity: 0, scale: 0.9 },
  animate :{ opacity: 1, scale: 1 },
  exit: { opacity: 0, x: 0 },   
};

export default function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [nextPath, setNextPath] = useState(null);
  const [transitionStage, setTransitionStage] = useState('animate');

  useEffect(() => {
    const handleNavigation = (e) => {
      if (e.detail !== location.pathname) {
        setNextPath(e.detail);
        setTransitionStage('exit');
      }
    };

    window.addEventListener('start-navigation', handleNavigation);

    return () => {
      window.removeEventListener('start-navigation', handleNavigation);
    };
  }, [location]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <AnimatePresence mode="wait">
      {(displayLocation.pathname === '/login' || displayLocation.pathname === '/') && <motion.div 
        className="blackOverlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />}
      <motion.div
        key={displayLocation.pathname}
        initial="initial"
        animate={transitionStage}
        exit="exit"
        variants={(displayLocation.pathname === '/login' || displayLocation.pathname === '/') ? loginVariants : defaultVariants}
        transition={(displayLocation.pathname === '/login' || displayLocation.pathname === '/') 
          ? { duration: 0.6, ease: 'easeIn' } 
          : { duration: 0.12, ease: 'easeInOut' }
        }
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        onAnimationComplete={() => {
          if (transitionStage === 'exit') {
            if (nextPath) {
              navigate(nextPath); 
              setDisplayLocation({ pathname: nextPath });
              setTransitionStage('animate');
            }
          }
        }}
      >
        {outlet}
      </motion.div>
      </AnimatePresence>
    </div>
  );
}
