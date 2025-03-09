import { motion } from 'framer-motion';

const TextAnimation = ({ text }) => {
    return (
        <motion.h1
            className='overflow-hidden whitespace-nowrap'
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
        >
            {text}
        </motion.h1>
    )
}

export default TextAnimation;