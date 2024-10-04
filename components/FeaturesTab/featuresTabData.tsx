import { FeatureTab } from "@/types/featureTab";

interface FeatureTabGroup {
  tab_name: string;           
  title: string;        
  features: FeatureTab[]; 
}

const featuresTabData: FeatureTabGroup[] = [
  {
    tab_name: "latest",
    title: "Event",
    features: [
      {
        id: 1,  // Unique numeric ID
        title: "Feature 1 for Event",
        desc1: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        desc2: `Nam id eleifend dui, id iaculis purus.`,
        videoUrl: "https://www.youtube.com/watch?v=hzk8rS9lkDs",
      },
      {
        id: 2,  // Unique numeric ID
        title: "Feature 2 for Event",
        desc1: `Ut ultricies lacus non fermentum ultrices.`,
        desc2: `Etiam lobortis neque nec finibus sagittis.`,
        videoUrl: "https://www.youtube.com/watch?v=hzk8rS9lkDs",
      },
    ],
  },
  {
    tab_name: "upcoming",
    title: "Ready to Use Pages You Need for a SaaS Business.",
    features: [
      {
        id: 1,  // Unique numeric ID
        title: "Feature 1 for SaaS",
        desc1: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        desc2: `Nulla ligula nunc egestas ut.`,
        videoUrl: "https://www.youtube.com/watch?v=hzk8rS9lkDs",
      },
      {
        id: 2,  // Unique numeric ID
        title: "Feature 2 for SaaS",
        desc1: `Fusce consectetur le.`,
        desc2: `Etiam lobortis neque nec finibus sagittis.`,
        videoUrl: "https://www.youtube.com/watch?v=hzk8rS9lkDs",
      },
    ],
  },
];

export default featuresTabData;
