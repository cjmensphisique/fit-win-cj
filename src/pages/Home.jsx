import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
        document.title = "CJ FITNESS | Elite Bodyweight Mastery & Aesthetics";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', 'Master your physique with CJ Fitness. Zero equipment, high-octane bodyweight training protocols for elite aesthetics and functional power.');
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
        <div className="home-container">
            <Navbar />
            
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-bg" style={{ backgroundImage: `url(${heroBg})` }}></div>
                <motion.div 
                    className="hero-content"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                >
                    <h1>Elite Aesthetics.<br />Zero Equipment.</h1>
                    <p>
                        The ultimate blueprint for building a powerful, shredded physique using nothing but your own bodyweight. No gym memberships. No cluttered machines. Just results.
                    </p>
                    <div className="cta-group">
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
                        <p>Track your progress with precision. Our portal provides the metrics you need to stay on top of your game.</p>
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
                            <img src={transformation1} alt="Before and after transformation showing muscle definition and physique improvement via bodyweight training" />
                            <div className="trans-badge">12 WEEKS</div>
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
                        <h2>Zero Gear.<br /><span className="text-yellow">Pure Mastery.</span></h2>
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
                            <img src={bodyweightMastery} alt="Athlete performing a perfect handstand on handles, demonstrating elite bodyweight control" />
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
                        { q: "Do I really need zero equipment?", a: "Yes. Our protocols focus on bodyweight mastery. While a pull-up bar is helpful, we provide alternatives for every movement." },
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
                <p>&copy; {new Date().getFullYear()} CJ FITNESS. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
