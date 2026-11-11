// framer-motion animation features, loaded as a separate chunk by <LazyMotion>
// in main.jsx so they stay out of the entry bundle. domMax (not domAnimation)
// because the navbar underline uses layoutId.
import { domMax } from 'framer-motion';

export default domMax;
