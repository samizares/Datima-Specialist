type BlogPost = {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  image: string;
  content: string;
};

const posts: BlogPost[] = [
  {
    id: "dental-visits",
    title: "How often Should adults and children see a dentist",
    tags: ["Dental Care", "Preventive Health"],
    createdAt: "2024-02-12",
    updatedAt: "2024-03-01",
    image: "/assets/dental-xray.png",
    content:
      "Regular dental visits help adults and children catch problems early and stay comfortable throughout the year. For most families, a checkup every six months keeps teeth clean, removes plaque, and gives your dentist a chance to spot cavities, gum irritation, and bite issues before they become painful. Children benefit from early assessments so growth and alignment can be monitored, and simple guidance about brushing, flossing, and diet can build habits that last. Adults who live with diabetes, gum disease, or a history of cavities may need more frequent visits, especially when symptoms like bleeding gums or sensitivity appear. A steady schedule also supports preventive treatments such as fluoride, sealants, and professional cleaning for hard-to-reach areas. If you have braces, implants, or ongoing treatment, your dentist may recommend shorter intervals to keep care on track. When life gets busy, it helps to pair dental checkups with a regular calendar routine so appointments do not get missed. Even when teeth feel fine, many dental issues develop silently, and that is why routine visits matter. Talk to your dentist about your health history, medications, and comfort concerns so the care plan matches your needs. By staying consistent, families reduce emergency visits and protect long-term oral health. Good oral hygiene at home, plus timely professional care, keeps smiles healthy and helps prevent complications that can affect overall wellbeing.",
  },
  {
    id: "eye-strain-symptoms",
    title: "Common symptoms of eye strain, blurred vision, headaches",
    tags: ["Eye Care", "Vision"],
    createdAt: "2024-01-18",
    updatedAt: "2024-02-10",
    image: "/assets/optometry-care.png",
    content:
      "Eye strain often builds quietly, especially for people who spend long hours on screens or close work. Common signs include dry or watery eyes, blurred vision after focusing for long periods, headaches around the temples, and a feeling of heaviness in the eyes. You may notice that you squint more, rub your eyes frequently, or struggle to shift focus from near to far. Lighting and glare can make symptoms worse, and some people feel neck or shoulder tension because posture changes when vision is strained. Taking regular breaks, adjusting screen brightness, and following the 20-20-20 rule can reduce fatigue. Blurred vision that comes and goes may signal that your prescription needs updating, or that your eyes are not coordinating effectively. Headaches can be triggered by the extra effort your eyes are making to stay focused. If symptoms persist despite rest and basic adjustments, an eye exam can identify issues such as uncorrected refractive errors, dry eye, or binocular vision problems. Early care is important because untreated strain can affect productivity, sleep quality, and overall comfort. An optometrist can recommend corrective lenses, lubricating drops, or changes in workstation setup. Managing screen time, staying hydrated, and keeping regular checkups ensures your eyes remain comfortable and clear throughout the day.",
  },
  {
    id: "childhood-illnesses",
    title: "Common childhood illnesses and when to see a doctor",
    tags: ["Paediatrics", "Family Health"],
    createdAt: "2024-03-05",
    updatedAt: "2024-03-08",
    image: "/assets/paedatrics-care.png",
    content:
      "Children frequently experience coughs, colds, mild fevers, and stomach upsets as their immune systems develop. While many of these illnesses can be managed at home with rest, fluids, and comfort care, there are times when medical attention is important. Seek advice if a fever is high, persists for more than two days, or is accompanied by lethargy, difficulty breathing, or dehydration. Persistent vomiting, severe diarrhea, or signs of pain in the ears, throat, or abdomen should also be evaluated. Rashes that spread quickly, appear with fever, or look unusual can signal an infection that needs assessment. For infants, any fever can be significant and should be discussed with a healthcare professional. Parents should also be mindful of changes in behavior, reduced appetite over several days, or a child who seems unusually irritable or difficult to console. When in doubt, a clinic visit can provide reassurance and guidance. Regular well-child visits allow pediatricians to monitor growth, update vaccinations, and discuss development milestones. Early care helps prevent complications and ensures that children recover safely and comfortably. Trust your instincts, and reach out when something feels off or symptoms are not improving.",
  },
  {
    id: "blood-sugar-monitoring",
    title: "Importance of regular blood sugar monitoring",
    tags: ["Endocrinology", "Wellness"],
    createdAt: "2024-02-02",
    updatedAt: "2024-02-22",
    image: "/assets/lab-test.png",
    content:
      "Regular blood sugar monitoring is essential for people with diabetes and for those at risk of developing it. Checking glucose levels helps patients understand how food, activity, stress, and medication affect their bodies throughout the day. When readings are consistent, treatment plans can be fine-tuned to improve energy, reduce symptoms, and prevent long-term complications. Monitoring also helps identify patterns such as overnight highs, post-meal spikes, or low readings after exercise. These insights guide decisions about meal timing, portion sizes, and medication adjustments. For individuals newly diagnosed, tracking glucose provides immediate feedback and builds confidence in managing the condition. Even for those without diabetes, routine screening can detect early changes and encourage preventive action. Working with a healthcare professional ensures that the monitoring schedule is appropriate and that the results are interpreted correctly. Educating family members about symptoms of low or high blood sugar creates a safer support system at home. Consistent monitoring, paired with healthy lifestyle choices and regular checkups, is one of the most effective ways to protect the heart, kidneys, eyes, and nerves. It also reduces emergency visits and helps patients feel more in control of their health journey.",
  },
];

const categories = [
  { label: "Dental Care", count: 12 },
  { label: "Eye Health", count: 9 },
  { label: "Paediatrics", count: 7 },
  { label: "Diagnostics", count: 5 },
];

const popularTags = [
  "Wellness",
  "Prevention",
  "Healthy Living",
  "Specialist Care",
  "Family Health",
  "Clinic Tips",
];

const formatSummary = (content: string, wordLimit = 100) => {
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length <= wordLimit) {
    return content;
  }
  return `${words.slice(0, wordLimit).join(" ")}...`;
};

const formatDisplayDate = (createdAt: string, updatedAt: string) => {
  const createdDate = new Date(createdAt);
  const updatedDate = new Date(updatedAt);
  const displayDate = updatedDate > createdDate ? updatedDate : createdDate;
  return displayDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export type { BlogPost };
export { posts, categories, popularTags, formatSummary, formatDisplayDate };
