export type ServiceLine = {
  title: string;
  description: string;
  schedule: string;
  image: string;
};

export const serviceLines: ServiceLine[] = [
  {
    title: "General Medical/Dental Clinics",
    description:
      "Our General and Dental clinic is focused on diagnosis and treatment of common illness, oral health, including the teeth, gums, and jaw. We treats conditions such as tooth decay, gum disease (gingivitis and periodontitis), tooth infections, oral pain, misaligned teeth, impacted wisdom teeth, oral lesions, jaw disorders, and cosmetic dental concerns.",
    schedule: "Mon: 8am - Saturday 9pm",
    image: "/assets/general-datima.png",
  },
  {
    title: "Cardiology",
    description:
      "Our Cardiology clinic diagnose, treat, and prevent diseases of the cardiovascular system. We manage conditions such as coronary artery disease, heart attacks, heart failure, arrhythmias (irregular heartbeats), hypertension (high blood pressure), congenital and valvular heart disease. We also address risk factors like high cholesterol, diabetes, obesity, and other heart disease.",
    schedule: "Wednesday: 12 noon - 5pm",
    image: "/assets/cardiology-datima.png",
  },
  {
    title: "ENT (Ear, Nose and Throat)",
    description:
      "Our ENT clinic treats conditions affecting hearing, balance, breathing, speech, and swallowing. We treat common illnesses like ear infections, hearing loss, sinusitis, allergies, tonsillitis,  and throat or laryngeal disorders.",
    schedule: "Saturday: 10am - 2pm",
    image: "/assets/ent-datima.png",
  },
  {
    title: "Obstetrics & Gynaecology",
    description:
      "Our OB-GYN clinic is focused on women’s reproductive health, pregnancy, and childbirth. We treats conditions such as menstrual disorders, infertility, pregnancy complications, fibroids, ovarian cysts, endometriosis, pelvic infections, menopause-related issues, and many others.",
    schedule: "Sunday: 10am - 2pm",
    image: "/assets/ob-gyn-datima.png",
  },
  {
    title: "Endocrinology",
    description: "Our Endocrinology clinic focus on hormones and the endocrine system. It involves diagnosing and treating hormone-related disorders such as diabetes, thyroid diseases, growth disorders, and metabolic conditions, helping regulate body functions like growth, metabolism, reproduction, and overall hormonal balance.",
    schedule: "Sunday: 2pm - 6pm",
    image: "/assets/endocrinilogy-datima.png",
  },
  {
    title: "Paediatrics (Children Clinic)",
    description: "Our Pediatric care focuses on the health and well-being of infants, children, and adolescents. It includes preventive care, growth and development monitoring, vaccinations, diagnosis and treatment of illnesses, and guidance for families to support a child’s physical, emotional, and social development.",
    schedule: "Friday: 10am - 2pm",
    image: "/assets/pediatric-datima.png",
  },
  {
    title: "Oral and Maxillofacial",
    description: "Our Oral and maxillofacial care  focuses on conditions affecting the mouth, jaws, face, and neck. It includes treatment of facial injuries, jaw disorders, impacted teeth, oral diseases, tumors, and corrective surgeries to restore function, appearance, and overall oral health",
    schedule: "Sunday: 2pm - 6pm",
    image: "/assets/oral-datima.png",
  },
  {
    title: "Restorative Dental",
    description: "Restorative dental care.",
    schedule: "Tuesday: 2pm - 6pm",
    image: "/assets/dental-xray-2.png",
  },
  {
    title: "Orthodontics",
    description: "Orthodontic treatments and alignment care.",
    schedule: "Tuesday: 10am - 2pm",
    image: "/assets/dental-xray.png",
  },
  {
    title: "Optometry/Eye Tests/Glasses",
    description:
      "Comprehensive eye examinations. Ophthalmology services. Cataract evaluation and surgery. Glaucoma diagnosis and treatment. Vision correction and eye disease management.",
    schedule: "Monday-Saturday: 8am - 5pm",
    image: "/assets/optometry-care.png",
  },
  {
    title: "Laboratory Services",
    description: "Routine blood and urine tests. Reliable and timely diagnostic testing.",
    schedule: "Monday - Saturday: 8am - 2pm. Sunday: 2pm - 6pm",
    image: "/assets/lab-test.png",
  },
];
