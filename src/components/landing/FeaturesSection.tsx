import { motion } from "framer-motion";
import { ListChecks, ArrowDownCircle, LineChart, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: ListChecks,
    title: "Step 1: Add Your Debts",
    description: "List all your debts in one place—credit cards, loans, or other obligations. Include details like balance, interest rates, and minimum payments to get started.",
    image: "/lovable-uploads/8d0a82e9-c145-44e4-874f-3a5833ba89e2.png"
  },
  {
    icon: ArrowDownCircle,
    title: "Step 2: Choose a Strategy",
    description: "Select a debt repayment plan that works best for you. Whether you prefer the Avalanche, Snowball, or Balance Ratio method, we'll help you decide the most effective path.",
    image: "/lovable-uploads/74be8f24-1cd3-4578-ae1d-3f77627da9fd.png"
  },
  {
    icon: LineChart,
    title: "Step 3: Track Your Progress",
    description: "Keep an eye on your progress with easy-to-read graphs and payoff timelines. Watch as your debts reduce and celebrate each milestone.",
  },
  {
    icon: Trophy,
    title: "Step 4: Stay Committed",
    description: "Stick to your plan and see the results! We'll guide you every step of the way with updates, tips, and insights to keep you on track.",
  },
];

const benefits = [
  "Simple and intuitive tools to organize and track your debts",
  "Proven repayment strategies tailored to your goals",
  "Detailed visual projections to keep you motivated",
];

const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Achieving financial freedom is as easy as following these simple steps:
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="mb-24 last:mb-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className={`space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {feature.description}
                  </p>
                </div>
                
                <div className={`relative ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  {feature.image ? (
                    <div className="aspect-[4/3] rounded-lg overflow-hidden">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] rounded-lg bg-white shadow-lg p-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                      <div className="relative z-10">
                        <div className="w-full h-full flex items-center justify-center">
                          <feature.icon className="w-16 h-16 text-primary/40" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">
            Why Debtfreeo Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-lg bg-white shadow-sm border border-gray-100"
              >
                <p className="text-gray-600">{benefit}</p>
              </motion.div>
            ))}
          </div>
          
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate("/planner")}
          >
            Ready to take control of your debt? Get Started Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;