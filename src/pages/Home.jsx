import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { m as motion, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import './Home.css';
import transformation1 from '../assets/images/transformation_1.png';
import testimonial1 from '../assets/images/testimonial_avatar_1.png';
import bodyweightMastery from '../assets/images/bodyweight_mastery.png';
import heroBg from '../assets/images/hero_bg.png';

const Home = () => {
    const navigate = useNavigate();
    const [activeFaq, setActiveFaq] = useState(null);

    useEffect(() => {
        // SEO: Set page-specific title and description
        document.title = "CJ FITNESS GEEK | Elite Bodyweight Mastery & Aesthetics";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', 'Master your physique with CJ Fitness Geek. Zero equipment, high-octane bodyweight training protocols for elite aesthetics and functional power.');
        }

        if (window.hideLoader) {
            window.hideLoader();
        }
    }, []);
    const WHATSAPP_NUMBER = "8667600388";
    const WHATSAPP_LINK = `https://wa.me/91${WHATSAPP_NUMBER}?text=Hey!%20I'm%20interested%20in%20building%20an%20aesthetic%20physique%20with%20zero%20equipment.%20Can%20you%20help%20me?`;

    const handleJoinClick = () => {
        window.open(WHATSAPP_LINK, '_blank');
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <LazyMotion features={domAnimation}>
            <div className="home-container">
                <Navbar />

                {/* Hero Section */}
                <section className="hero ">
                    <div className="hero-overlay"></div>
                    <div className="hero-bg" style={{ backgroundImage: `url(${heroBg})` }}></div>
                    <motion.div
                        className="hero-content"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                    >
                        <h1>Elite Aesthetics.<br />Zero Weights.</h1>
                        <p className=''>
                            The ultimate blueprint for building a powerful, shredded physique using nothing but your own bodyweight. No gym memberships. No cluttered machines. Just results.
                        </p>
                        <div className="cta-group ">
                            <button className="btn-primary" onClick={handleJoinClick}>
                                Start Your Transformation
                            </button>
                            <button className="btn-secondary" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
                                The Road Map
                            </button>
                        </div>
                    </motion.div>
                    <div className="scroll-indicator" onClick={() => document.getElementById('philosophy').scrollIntoView({ behavior: 'smooth' })}>
                        <span>Scroll to Explore</span>
                        <i className="fas fa-chevron-down"></i>
                    </div>
                </section>

                {/* Philosophy Section */}
                <section id="philosophy" className="philosophy">
                    <motion.div
                        className="section-head"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                    >
                        <h2>The Redefined Standard</h2>
                        <p>Functional power meets Greek god aesthetics. This is how we train.</p>
                    </motion.div>

                    <motion.div
                        className="philosophy-grid"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                    >
                        <motion.div className="phi-card" variants={fadeIn}>
                            <i className="fas fa-dumbbell"></i>
                            <h3>Minimalist Approach</h3>
                            <p>No expensive memberships. No crowded machines. Just raw, effective training that you can do anywhere, anytime.</p>
                        </motion.div>
                        <motion.div className="phi-card" variants={fadeIn}>
                            <i className="fas fa-heartbeat"></i>
                            <h3>Aesthetic Precision</h3>
                            <p>We focus on proportions and symmetry. Build a body that doesn't just look strong, but is fundamentally powerful.</p>
                        </motion.div>
                        <motion.div className="phi-card" variants={fadeIn}>
                            <i className="fas fa-chart-line"></i>
                            <h3>Data-Driven Growth</h3>
                            <p>Track your progress with our App. Our App provides all metrics you need to stay on top of your game Consistently.</p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Transformation Section [NEW] */}
                <section id="transformations" className="transformations">
                    <motion.div
                        className="section-head"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                    >
                        <h2>Visual Proof</h2>
                        <p>Our training protocols aren't theoretical. They're proven. See the results for yourself.</p>
                    </motion.div>

                    <div className="transformation-container">
                        <motion.div
                            className="transformation-card"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                        >
                            <div className="trans-img-wrapper">
                                <img src={transformation1} width="640" height="640" alt="Before and after transformation showing muscle definition and physique improvement via bodyweight training" />
                                <div className="trans-badge">16 WEEKS</div>
                            </div>
                            <div className="trans-content">
                                <h3>Muscle Hypertrophy Phase</h3>
                                <p aria-label="Customer testimonial">"I never thought I could build this much muscle without lifting a single dumbbell. The results speak for themselves."</p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* No Equipment Section */}
                <section id="no-gear" className="no-gear">
                    <div className="content-split">
                        <motion.div
                            className="text-side"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                        >
                            <h2>Zero Weights.<br /><span className="text-yellow">Pure Mastery.</span></h2>
                            <p>
                                We don't use dumbbells. We don't use pulleys. We use the most advanced machine ever created: <strong>Your Body.</strong>
                                By following my specific bodyweight protocols, you'll build muscle that is both aesthetic and functional.
                            </p>
                            <ul className="feature-list">
                                <li><i className="fas fa-check"></i> 100% Floor & Bodyweight based</li>
                                <li><i className="fas fa-check"></i> Master the Handstand, Muscle-Up, and Front Lever</li>
                                <li><i className="fas fa-check"></i> Sculpt a Greek God physique from home</li>
                            </ul>
                        </motion.div>
                        <motion.div
                            className="image-side"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                        >
                            <div className="img-frame">
                                <img src={bodyweightMastery} width="640" height="640" alt="Athlete performing a perfect handstand on handles, demonstrating elite bodyweight control" />
                            </div>
                        </motion.div>
                    </div>
                </section>


                {/* How It Works Section / Roadmap */}
                <section id="how-it-works" className="how-it-works">
                    <motion.div
                        className="section-head"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                    >
                        <h2>The Roadmap to Win</h2>
                        <p>Your step-by-step path from where you are to an elite look.</p>
                    </motion.div>

                    <motion.div
                        className="steps-container"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div className="step-card" variants={fadeIn}>
                            <div className="step-num">01</div>
                            <h3>The Consultation</h3>
                            <p>Direct message me on WhatsApp. We discuss your goals, current level, and limitations.</p>
                        </motion.div>
                        <motion.div className="step-card" variants={fadeIn}>
                            <div className="step-num">02</div>
                            <h3>The Blueprint</h3>
                            <p>Receive a custom-tailored workout and nutrition plan designed specifically for your body and lifestyle.</p>
                        </motion.div>
                        <motion.div className="step-card" variants={fadeIn}>
                            <div className="step-num">03</div>
                            <h3>The Execution</h3>
                            <p>Log your workouts in our elite portal, track your progress, and see the transformation happen in real-time.</p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* FAQ Section [NEW] */}
                <section id="faq" className="faq">
                    <motion.div
                        className="section-head"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                    >
                        <h2>Frequently Asked Questions</h2>
                    </motion.div>

                    <div className="faq-container">
                        {[
                            { q: "Do I really need zero weights?", a: "Yes. Our protocols focus on bodyweight mastery. While a pull-up bar is helpful, we provide alternatives for every movement." },
                            { q: "How long until I see results?", a: "Most clients see significant changes in muscle definition and strength within the first 4-6 weeks of consistent training." },
                            { q: "Is this suitable for beginners?", a: "Absolutely. We scale every exercise to your current level, from absolute beginner to elite athlete." }
                        ].map((item, index) => (
                            <div key={index} className={`faq-item ${activeFaq === index ? 'active' : ''}`} onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                                <div className="faq-question">
                                    <h3>{item.q}</h3>
                                    <i className={`fas fa-chevron-${activeFaq === index ? 'up' : 'down'}`}></i>
                                </div>
                                <AnimatePresence>
                                    {activeFaq === index && (
                                        <motion.div
                                            className="faq-answer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            <p>{item.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-final">
                    <div className="cta-content">
                        <h2>Stop Waiting. Start Winning.</h2>
                        <p>Limited slots available for personalized coaching.</p>
                        <button className="btn-primary" onClick={handleJoinClick}>
                            DM Me on WhatsApp
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="footer">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h4><span>CJ</span><span> FITNESS GEEK</span></h4>
                            <p>Master your physique with elite, zero-equipment bodyweight training protocols. Designed for functional strength, flexibility, and premium aesthetics.</p>
                        </div>
                        <div className="footer-links">
                            <h5>Navigation</h5>
                            <ul>
                                <li><a href="#philosophy" onClick={(e) => { e.preventDefault(); document.getElementById('philosophy').scrollIntoView({ behavior: 'smooth' }); }}>Philosophy</a></li>
                                <li><a href="#transformations" onClick={(e) => { e.preventDefault(); document.getElementById('transformations').scrollIntoView({ behavior: 'smooth' }); }}>Transformations</a></li>
                                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' }); }}>Roadmap</a></li>
                                <li><a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq').scrollIntoView({ behavior: 'smooth' }); }}>FAQ</a></li>
                            </ul>
                        </div>
                        <div className="footer-social">
                            <h5>Connect With Us</h5>
                            <p className="social-text">Follow our daily workouts, reels, client transformations, and motivation.</p>
                            <div className="social-icons">
                                <a 
                                    href="https://www.instagram.com/cj_fitness_geek?igsh=MWM4aGRzYzhqMWtsZg==" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="social-icon-link"
                                    aria-label="Follow CJ Fitness Geek on Instagram"
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                    </svg>
                                </a>
                                <a 
                                    href="https://www.facebook.com/share/1A8JgJY7wk/" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="social-icon-link"
                                    aria-label="Follow CJ Fitness Geek on Facebook"
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="w-5 h-5">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                    </svg>
                                </a>
                                <a 
                                    href={WHATSAPP_LINK} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="social-icon-link"
                                    aria-label="Contact CJ Fitness Geek on WhatsApp"
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="w-5 h-5">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.288 1.479 4.884 1.48 5.532 0 10.016-4.486 10.018-10.02.001-2.679-1.037-5.197-2.926-7.09C16.732 1.63 14.225.592 11.545.592c-5.539 0-10.027 4.49-10.029 10.026-.001 1.79.47 3.535 1.365 5.093l-.995 3.63 3.762-.987zm11.233-7.518c-.3-.15-1.77-.874-2.045-.973-.274-.1-.474-.15-.673.15-.2.3-.773.974-.95 1.173-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.486-.89-.794-1.49-1.775-1.665-2.075-.175-.3-.019-.462.13-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.673-1.62-.922-2.206-.24-.58-.51-.5-.673-.508-.152-.008-.328-.01-.504-.01-.176 0-.463.066-.705.33-.242.264-.925.9-.925 2.2 0 1.3.947 2.548 1.079 2.723.132.175 1.86 2.84 4.512 3.986.63.272 1.123.435 1.507.556.634.2 1.21.171 1.666.103.508-.075 1.77-.723 2.018-1.423.25-.7.25-1.3.175-1.423-.075-.125-.275-.2-.575-.35z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} CJ FITNESS GEEK. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </LazyMotion>
    );
};

export default Home;
