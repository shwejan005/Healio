/**
 * Curated mental health resource corpus for RAG retrieval.
 * Each resource is a focused ~100-200 word passage optimized for semantic search.
 */

export interface MentalHealthResource {
  id: string
  category: string
  title: string
  content: string
}

export const MENTAL_HEALTH_RESOURCES: MentalHealthResource[] = [
  // --- Anxiety Management ---
  {
    id: "anxiety-understanding",
    category: "anxiety",
    title: "Understanding Anxiety",
    content:
      "Anxiety is your body's natural response to stress — it's a feeling of fear or apprehension about what's to come. While occasional anxiety is normal, persistent anxiety that interferes with daily life may indicate an anxiety disorder. Common symptoms include restlessness, rapid heartbeat, difficulty concentrating, muscle tension, and sleep problems. Understanding that anxiety is a physiological response, not a character flaw, is the first step toward managing it effectively. Your brain's fight-or-flight system is simply overactive, and there are proven techniques to calm it down.",
  },
  {
    id: "anxiety-grounding",
    category: "anxiety",
    title: "The 5-4-3-2-1 Grounding Technique",
    content:
      "When anxiety feels overwhelming, try the 5-4-3-2-1 grounding technique to bring yourself back to the present moment. Identify 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This sensory-based exercise interrupts the anxiety spiral by redirecting your focus from worried thoughts to your immediate physical environment. Practice this technique regularly so it becomes second nature when you need it most. It works because it engages your rational brain and reduces the dominance of your emotional response.",
  },
  {
    id: "anxiety-coping",
    category: "anxiety",
    title: "Daily Coping Strategies for Anxiety",
    content:
      "Managing anxiety day-to-day involves building a toolkit of healthy coping strategies. Limit caffeine and alcohol as they can worsen anxiety symptoms. Establish a consistent daily routine to create predictability. Practice saying 'no' to avoid overcommitting. Break large tasks into smaller, manageable steps. Keep a worry journal — writing down anxious thoughts can help externalize them and reduce their power. Challenge catastrophic thinking by asking yourself: 'What's the evidence? What's the most likely outcome?' Regular physical exercise is one of the most effective natural anti-anxiety treatments.",
  },

  // --- Stress Reduction ---
  {
    id: "stress-understanding",
    category: "stress",
    title: "Understanding and Managing Stress",
    content:
      "Stress is your body's reaction to demands or threats. In small doses, stress can be motivating, but chronic stress takes a serious toll on your physical and mental health. It can lead to headaches, muscle tension, digestive problems, weakened immunity, and mood changes. The key to managing stress isn't eliminating it entirely but developing healthy responses. Identify your stress triggers and categorize them: things you can control, things you can influence, and things you cannot change. Focus your energy on the first two categories and practice acceptance for the third.",
  },
  {
    id: "stress-progressive-relaxation",
    category: "stress",
    title: "Progressive Muscle Relaxation",
    content:
      "Progressive Muscle Relaxation (PMR) is a proven stress-reduction technique. Starting from your toes, tense each muscle group for 5-10 seconds, then release and notice the contrast between tension and relaxation. Work your way up through your calves, thighs, abdomen, hands, arms, shoulders, neck, and face. This 10-15 minute practice trains your body to recognize and release physical tension that accumulates during stressful periods. Regular practice can lower overall tension levels, reduce anxiety, improve sleep quality, and help you become more aware of physical stress signals before they escalate.",
  },
  {
    id: "stress-time-management",
    category: "stress",
    title: "Time Management for Stress Reduction",
    content:
      "Poor time management is a major contributor to chronic stress. Use the Eisenhower Matrix: categorize tasks as urgent/important, important/not urgent, urgent/not important, or neither. Prioritize important tasks and delegate or eliminate the rest. Use time-blocking to dedicate focused periods to specific tasks. Build buffer time between commitments. Learn to say 'no' gracefully to protect your energy. The Pomodoro Technique — 25 minutes of focused work followed by a 5-minute break — can help maintain productivity without burnout. Remember: being busy isn't the same as being productive.",
  },

  // --- Sleep Hygiene ---
  {
    id: "sleep-hygiene-basics",
    category: "sleep",
    title: "Sleep Hygiene Fundamentals",
    content:
      "Good sleep hygiene is essential for mental health. Aim for 7-9 hours of sleep per night. Go to bed and wake up at the same time every day, even on weekends. Create a cool, dark, quiet sleeping environment. Avoid screens for at least 30 minutes before bed as blue light suppresses melatonin production. Limit caffeine after 2 PM and avoid heavy meals close to bedtime. If you can't fall asleep within 20 minutes, get up and do something calming until you feel sleepy. Your bedroom should be associated with sleep, not work or screen time.",
  },
  {
    id: "sleep-routine",
    category: "sleep",
    title: "Building a Bedtime Routine",
    content:
      "A consistent bedtime routine signals to your brain that it's time to wind down. Start your routine 30-60 minutes before bed. Consider including: a warm shower or bath, gentle stretching or yoga, reading a physical book, journaling about your day, listening to calming music or nature sounds, or practicing progressive muscle relaxation. Avoid stimulating activities like intense exercise, heated discussions, or engaging social media. Herbal teas like chamomile or valerian root may promote relaxation. The key is consistency — your brain will begin to associate these activities with sleep preparation.",
  },
  {
    id: "sleep-debt",
    category: "sleep",
    title: "Understanding Sleep Debt and Recovery",
    content:
      "Sleep debt accumulates when you consistently get less sleep than your body needs. Even losing 1-2 hours per night adds up over a week, leading to impaired concentration, mood swings, weakened immunity, and increased stress hormones. You can't fully 'catch up' on sleep with one long night. Instead, gradually adjust your bedtime earlier by 15-30 minutes until you reach your target. Naps of 20-30 minutes can help, but avoid napping after 3 PM as it may interfere with nighttime sleep. Tracking your sleep patterns can help identify problematic habits.",
  },

  // --- Mindfulness & Meditation ---
  {
    id: "mindfulness-intro",
    category: "mindfulness",
    title: "Introduction to Mindfulness",
    content:
      "Mindfulness is the practice of paying attention to the present moment without judgment. Research shows it can reduce stress, anxiety, depression, and even physical pain. Start with just 5 minutes of daily practice: sit comfortably, close your eyes, and focus on your breath. When your mind wanders (and it will), gently bring your attention back without self-criticism. The goal isn't to stop thinking — it's to notice your thoughts without getting caught up in them. Think of it as mental fitness training. Like physical exercise, the benefits compound with consistent practice.",
  },
  {
    id: "mindfulness-daily",
    category: "mindfulness",
    title: "Integrating Mindfulness into Daily Life",
    content:
      "You don't need a meditation cushion to practice mindfulness. Try these micro-practices throughout your day: mindful eating — notice the colors, textures, and flavors of your food without distractions. Mindful walking — feel each step, the ground beneath your feet, the air on your skin. Mindful listening — in conversations, give your full attention without planning your response. Take three conscious breaths before starting a new task. Notice five things in your environment you usually overlook. These small moments of presence accumulate and gradually shift your relationship with stress and anxiety.",
  },

  // --- Depression Awareness ---
  {
    id: "depression-understanding",
    category: "depression",
    title: "Understanding Depression",
    content:
      "Depression is more than sadness — it's a persistent condition that affects how you think, feel, and handle daily activities. Symptoms include loss of interest in activities you used to enjoy, changes in appetite or weight, sleep disturbances, fatigue, difficulty concentrating, feelings of worthlessness, and in severe cases, thoughts of self-harm. Depression is not a sign of weakness; it's a medical condition involving changes in brain chemistry. It's treatable, and seeking help is a sign of courage. If you've experienced these symptoms for more than two weeks, consider speaking with a mental health professional.",
  },
  {
    id: "depression-self-care",
    category: "depression",
    title: "Self-Care Strategies When Feeling Low",
    content:
      "When depression makes everything feel difficult, small actions matter. Start with basic self-care: take a shower, eat a nourishing meal, step outside for fresh air even for 5 minutes. Avoid isolation — reach out to one trusted person, even with a simple text. Gentle movement like a short walk can shift your mood through endorphin release. Set one tiny, achievable goal each day rather than an overwhelming to-do list. Practice self-compassion: talk to yourself the way you'd talk to a friend going through a hard time. Remember that feeling better often starts with doing better, even in small ways.",
  },

  // --- CBT Techniques ---
  {
    id: "cbt-thought-challenging",
    category: "cbt",
    title: "Cognitive Behavioral Technique: Thought Challenging",
    content:
      "Cognitive Behavioral Therapy (CBT) teaches that our thoughts, feelings, and behaviors are interconnected. When you notice a negative automatic thought, challenge it with these questions: What evidence supports this thought? What evidence contradicts it? Am I catastrophizing or assuming the worst? What would I tell a friend thinking this way? What's a more balanced perspective? For example, the thought 'I always fail' might become 'I've struggled with some things, but I've also had successes.' This isn't about positive thinking — it's about accurate, balanced thinking that reduces unnecessary emotional suffering.",
  },
  {
    id: "cbt-behavioral-activation",
    category: "cbt",
    title: "Behavioral Activation for Better Mood",
    content:
      "Behavioral activation is a CBT technique based on the principle that action often precedes motivation. When you're feeling low, don't wait until you feel like doing something — start with small, values-aligned activities. Schedule pleasant activities into your day, even brief ones: call a friend, take a walk, cook a meal, listen to music. Track the relationship between your activities and your mood. You'll often find that engagement improves mood, creating a positive upward spiral. The key is starting small and building gradually. Activity scheduling can be as powerful as medication for mild to moderate depression.",
  },

  // --- Breathing Exercises ---
  {
    id: "breathing-box",
    category: "breathing",
    title: "Box Breathing Technique",
    content:
      "Box breathing (also called square breathing) is used by Navy SEALs and first responders to manage stress in high-pressure situations. Breathe in slowly for 4 counts, hold for 4 counts, breathe out for 4 counts, hold for 4 counts. Repeat 4-6 times. This technique activates your parasympathetic nervous system, lowering heart rate and blood pressure. It's discreet enough to practice anywhere — in meetings, before presentations, or during anxious moments. Start practicing when calm so the technique becomes automatic when you need it during stressful situations.",
  },
  {
    id: "breathing-478",
    category: "breathing",
    title: "The 4-7-8 Relaxation Breath",
    content:
      "The 4-7-8 breathing technique, developed by Dr. Andrew Weil, is especially effective for falling asleep and calming acute anxiety. Breathe in through your nose for 4 counts, hold your breath for 7 counts, then exhale slowly through your mouth for 8 counts. The extended exhale is key — it stimulates the vagus nerve and activates your body's relaxation response. Practice this twice daily and whenever you feel stressed or can't sleep. After a few weeks of regular practice, many people find it becomes a powerful natural tranquilizer for their nervous system.",
  },

  // --- Journaling & Gratitude ---
  {
    id: "journaling-benefits",
    category: "journaling",
    title: "The Mental Health Benefits of Journaling",
    content:
      "Regular journaling is one of the most accessible and effective mental health tools. Writing about your thoughts and emotions helps process difficult experiences, identify patterns in your mood, clarify your thinking, and release pent-up emotions. You don't need to write perfectly — stream of consciousness is fine. Try journaling for 10-15 minutes daily. Prompts can help: 'What am I feeling right now and why?' 'What went well today?' 'What's worrying me, and what can I do about it?' Research shows that expressive writing can reduce symptoms of depression, anxiety, and PTSD while boosting immune function.",
  },
  {
    id: "gratitude-practice",
    category: "gratitude",
    title: "Building a Gratitude Practice",
    content:
      "Gratitude journaling rewires your brain to notice positive experiences. Write down 3 specific things you're grateful for each day — be detailed rather than generic. Instead of 'I'm grateful for my family,' write 'I'm grateful that my sister called to check on me today.' This specificity trains your brain to scan for positive moments throughout the day. Research shows that consistent gratitude practice increases happiness, reduces depression, improves sleep quality, and strengthens relationships. It takes about 3 weeks of daily practice for the habit to start feeling natural and for benefits to become noticeable.",
  },

  // --- Exercise & Mental Health ---
  {
    id: "exercise-mental-health",
    category: "exercise",
    title: "Exercise as Mental Health Medicine",
    content:
      "Regular physical activity is one of the most powerful tools for mental health. Exercise releases endorphins, serotonin, and dopamine — natural mood elevators. Just 30 minutes of moderate exercise, 3-5 times per week, can be as effective as antidepressant medication for mild to moderate depression. You don't need intense workouts — walking, yoga, swimming, or dancing all count. Exercise also reduces cortisol (stress hormone), improves sleep quality, boosts self-confidence, and provides healthy coping mechanisms. Start where you are: even a 10-minute walk is beneficial. The best exercise is the one you'll actually do consistently.",
  },
  {
    id: "exercise-motivation",
    category: "exercise",
    title: "Finding Motivation to Move When You're Struggling",
    content:
      "When mental health makes exercise feel impossible, lower the bar dramatically. Commit to just 5 minutes — you can always stop after that. Most people find that once they start, they continue. Choose activities you genuinely enjoy rather than what you 'should' do. Pair exercise with something pleasant: a favorite podcast while walking, a fun class with a friend, or music that energizes you. Track your movement not for performance but for mood correlation — notice how you feel before and after. Celebrate every session, no matter how short. Consistency matters more than intensity.",
  },

  // --- Social Connection ---
  {
    id: "social-connection",
    category: "relationships",
    title: "The Importance of Social Connection",
    content:
      "Human connection is a fundamental mental health need. Loneliness and social isolation increase the risk of depression, anxiety, and even physical health problems. You don't need a large social circle — quality matters more than quantity. Nurture your closest relationships with regular, meaningful contact. Join groups aligned with your interests: book clubs, sports teams, volunteer organizations, or online communities. If socializing feels draining, start small: one meaningful conversation per day. Practice vulnerability by sharing how you really feel with trusted people. Remember that most people are also seeking deeper connection.",
  },
  {
    id: "boundaries-setting",
    category: "relationships",
    title: "Setting Healthy Boundaries",
    content:
      "Healthy boundaries are essential for mental wellness. Boundaries aren't walls — they're guidelines for how you want to be treated and how much energy you can give. Start by identifying where you feel resentful, drained, or taken advantage of — these are signs of boundary needs. Practice saying 'no' without over-explaining. Use 'I' statements: 'I need some time to recharge' rather than 'You're too demanding.' It's okay to limit contact with people who consistently drain your energy. Boundaries may feel uncomfortable at first, especially if you're a people-pleaser, but they ultimately lead to healthier, more authentic relationships.",
  },

  // --- Self-Compassion ---
  {
    id: "self-compassion",
    category: "self-care",
    title: "Practicing Self-Compassion",
    content:
      "Self-compassion means treating yourself with the same kindness you'd offer a good friend. When you make a mistake or face difficulty, notice your self-talk. Replace harsh criticism ('I'm such a failure') with compassionate understanding ('This is hard, and I'm doing my best'). Self-compassion has three components: self-kindness instead of self-judgment, common humanity (recognizing suffering is part of the shared human experience), and mindfulness (acknowledging pain without over-identifying with it). Research by Dr. Kristin Neff shows that self-compassion is more effective than self-esteem for resilience, motivation, and emotional well-being.",
  },

  // --- Crisis Resources ---
  {
    id: "crisis-when-to-seek-help",
    category: "crisis",
    title: "When to Seek Professional Help",
    content:
      "It's important to seek professional help when mental health challenges significantly interfere with your daily functioning. Warning signs include: persistent sadness or hopelessness lasting more than two weeks, inability to perform daily tasks, withdrawal from activities and relationships, significant changes in sleep or appetite, thoughts of self-harm or suicide, increased substance use, or overwhelming anxiety that doesn't subside. You don't need to be in crisis to seek help — therapy is also valuable for personal growth and prevention. Contact the 988 Suicide & Crisis Lifeline (call or text 988) if you or someone you know is in immediate danger.",
  },

  // --- Mood Tracking ---
  {
    id: "mood-tracking-benefits",
    category: "tracking",
    title: "Why Tracking Your Mood Matters",
    content:
      "Regular mood tracking helps you identify patterns between your emotions and daily habits. By recording your mood, sleep, activities, and stress levels, you can discover which factors positively or negatively influence your mental state. For example, you might notice that your mood drops after poor sleep, improves after exercise, or worsens during certain work situations. This data empowers you to make informed decisions about your lifestyle and helps you communicate more effectively with therapists or healthcare providers. Even simple daily check-ins — rating your mood on a scale of 1-10 — provide valuable insights over time.",
  },

  // --- Digital Wellness ---
  {
    id: "digital-wellness",
    category: "self-care",
    title: "Digital Wellness and Mental Health",
    content:
      "Excessive screen time and social media use are linked to increased anxiety, depression, and poor sleep. Practice digital wellness by setting specific times for checking social media rather than scrolling continuously. Turn off non-essential notifications. Establish tech-free zones (bedroom, dining table) and tech-free times (first hour of morning, last hour before bed). Curate your social media feeds — unfollow accounts that trigger comparison or negativity. Replace mindless scrolling with intentional activities: reading, creating, or connecting with people in person. A digital detox, even for 24 hours, can significantly reduce stress and improve focus.",
  },

  // --- Nutrition and Mental Health ---
  {
    id: "nutrition-mental-health",
    category: "nutrition",
    title: "Nutrition and Its Impact on Mental Health",
    content:
      "What you eat directly affects your brain chemistry and mental health. A diet rich in fruits, vegetables, whole grains, lean proteins, and omega-3 fatty acids (found in fish, walnuts, and flaxseed) supports optimal brain function and mood regulation. Gut health is particularly important — your gut produces about 95% of your body's serotonin. Probiotic-rich foods like yogurt, kimchi, and sauerkraut support a healthy gut microbiome. Minimize processed foods, excessive sugar, and refined carbohydrates, which can cause energy crashes and mood swings. Stay hydrated — even mild dehydration can affect your mood and cognitive function.",
  },
]
