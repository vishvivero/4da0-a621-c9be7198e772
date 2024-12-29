import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 py-16">
      <div className="container mx-auto px-4 space-y-16">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              About <span className="text-primary">Debtfreeo</span>
            </h1>
            <p className="text-xl text-gray-600">
              Hey there! 👋
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm space-y-6"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-semibold">
                  I'm <span className="text-primary">Vishnu Raj</span>,
                </h2>
                <h2 className="text-4xl font-semibold text-gray-900">
                  behind <span className="text-gray-900">Debtfreeo</span>
                </h2>
                <p className="text-gray-600">
                  Originally from Kerala, India, I now work from the vibrant city of London, 
                  where I aim to help individuals take control of their finances and achieve 
                  financial freedom.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  From Product Manager to Solopreneur
                </h3>
                <p className="text-gray-600">
                  With over 11 years of international experience, I've transitioned from 
                  leading global operations at top organizations to building innovative tools 
                  that simplify financial management. Debtfreeo reflects my passion for solving 
                  complex challenges and empowering others on their journey to financial freedom.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  A Little About Me
                </h3>
                <p className="text-gray-600">
                  When I'm not designing solutions or optimizing tools, I'm exploring the world 
                  with my wife. One of our favorite adventures? Ready to Skydive over Dubai's 
                  iconic Palm Jumeirah! 🌍
                </p>
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src="/lovable-uploads/0fa47c2a-0883-4eb3-9b7e-52e9ed370982.png" 
                    alt="Ready to Enjoy the thrill of skydiving in Dubai with my wife!"
                    className="w-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 text-sm">
                    Ready to Enjoy the thrill of skydiving in Dubai with my wife!
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  The Personal Touch
                </h3>
                <p className="text-gray-600">
                  Debtfreeo isn't just a platform—it's a mission. As a one-person team, 
                  I ensure every user gets a personalized experience, handling everything 
                  from product development to customer support myself.
                </p>
                <p className="text-gray-600">
                  When you connect with Debtfreeo, you connect directly with me—someone 
                  committed to helping you achieve financial success.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Why Debtfreeo?
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Proven Strategies: Tailored methods like Avalanche and Snowball for effective debt repayment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Simple Tools: Track your progress with intuitive charts and dashboards.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Direct Support: I'm just a message away for questions, suggestions, or feedback.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Let's Connect
                </h3>
                <p className="text-gray-600">
                  Have questions, need help, or just want to say hi? Reach out through the platform 
                  or connect with me on{" "}
                  <a 
                    href="https://www.linkedin.com/in/vishnurajkp" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    LinkedIn
                  </a>.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;