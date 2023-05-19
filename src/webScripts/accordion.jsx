import * as React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

//
// This is a library used to create the smooth accordion animation
// on the admin page.
// TODO: Properly attribute this code, as its not ours
//

const Accordion = ({ i, expanded, setExpanded, topElement, innerElement }) => {
    const isOpen = i === expanded

    // By using `AnimatePresence` to mount and unmount the contents, we can animate
    // them in and out while also only rendering the contents of open accordions
    return (
        <>
            <motion.header onClick={() => setExpanded(isOpen ? false : i)}>
                {topElement}
            </motion.header>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.section
                        key='content'
                        initial='collapsed'
                        animate='open'
                        exit='collapsed'
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 },
                        }}
                        transition={{
                            applyAtStart: {
                                height: {
                                    duration: 1,
                                    ease: [0.04, 0.62, 0.23, 0.98],
                                },
                                opacity: {
                                    delay: 1,
                                    duration: 2,
                                    ease: [0.04, 0.62, 0.23, 0.98],
                                },
                            },
                            applyAtEnd: {
                                height: {
                                    delay: 2,
                                    duration: 1,
                                    ease: [0.04, 0.62, 0.23, 0.98],
                                },
                                opacity: {
                                    duration: 2,
                                    ease: [0.04, 0.62, 0.23, 0.98],
                                },
                            },
                        }}
                    >
                        {innerElement}
                    </motion.section>
                )}
            </AnimatePresence>
        </>
    )
}

export const ConfigAccordion = ({ topElement, innerElement }) => {
    // This approach is if you only want max one section open at a time. If you want multiple
    // sections to potentially be open simultaneously, they can all be given their own `useState`.
    const [expanded, setExpanded] = useState(0)

    return (
        <Accordion
            i={1}
            expanded={expanded}
            setExpanded={setExpanded}
            topElement={topElement}
            innerElement={innerElement}
        />
    )
}
