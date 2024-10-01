import images from './images';

const Menu = [{
        text: 'Cardano HUB',
        link: '',
    },
    {
        text: 'EVENT',
        link: '#use-cases',
    },
    {
        text: 'Blog',
        link: 'Latest Post',
    },
    {
        text: 'Quest',
        link: 'Available Quest',
    },

];

const ServicesData = [{
        titleone: 'Event Latest',
        link: '#',
        itemclass: 'blight',
        imgURL: images.services01,
        description: "Join us in exploring the latest events in the Cardano ecosystem. Engage with developers and enthusiasts as we showcase the advancements and future of Cardano. Our events are designed to foster collaboration and innovation, ensuring that Cardano continues to thrive as a leading blockchain platform.",
    },
    {
        titleone: 'Ecosystem Growth',
        titletwo: '',
        link: '#',
        itemclass: 'bgreen',
        imgURL: images.services02,
        description: "Unlock the full potential of the Cardano ecosystem with our comprehensive growth services. We focus on attracting developers, users, and investors, fostering an innovative environment that drives the Cardano network's expansion and success.",
    },
    {
        titleone: 'Performance Optimization',
        itemclass: 'bdark',
        imgURL: images.services03,
        description: "Maximize your Cardano experience with our performance optimization services. We ensure that your interactions within the Cardano blockchain are seamless and efficient, supporting your endeavors in a fast-paced blockchain environment.",
    },
    {
        titleone: 'Support for Cardano Projects',
        titletwo: '',
        link: '#',
        itemclass: 'blight',
        imgURL: images.services04,
        description: "Empower your Cardano projects with our expert support services. We provide the resources and guidance necessary to navigate the Cardano ecosystem, ensuring that your project reaches its full potential and thrives within the community.",
    },
    {
        titleone: 'Transparent Development',
        titletwo: 'Operations',
        link: '#',
        itemclass: 'bgreen',
        imgURL: images.services05,
        description: "Experience unparalleled transparency in the Cardano ecosystem. Our commitment to open communication and visibility fosters trust and accountability, ensuring that every stakeholder is informed and engaged in the development process.",
    },
    {
        titleone: 'Competitive Fees',
        titletwo: '7% Fees',
        link: '#',
        itemclass: 'bdark',
        imgURL: images.services06,
        description: "Maximize your investment in the Cardano ecosystem with our competitive fee structure. We believe in empowering our clients, ensuring that you receive the best value for your contributions to the Cardano network.",
    },
];

const CaseStudies = [{
        text: 'Event 1: Blockchain Basics',
        link: '#',
        image: 'path/to/image1.jpg',
        video: 'https://www.youtube.com/embed/o1z1nYcorI4?autoplay=1',
    },
    {
        text: 'Event 2: Advanced Smart Contracts',
        link: '#',
        image: 'path/to/image2.jpg',
        video: 'https://www.youtube.com/embed/videoID2',
    },
];


const WorkingProcess = [{
        title: 'Our Recent Cardano Development',
        description: 'Our latest project focuses on creating and managing decentralized applications on the Cardano blockchain. Thanks to the Cardano community for their belief and support in our efforts to enhance the ecosystem.',
    },
    {
        title: 'Snapshot Provider',
        description: 'Stay updated with the latest developments in the Cardano ecosystem through our Snapshot Provider. We provide quick access to historical data, essential for developers and users alike.',
    },
    {
        title: 'Guide to Cardano',
        description: 'Whether you’re a developer, investor, or blockchain enthusiast, understanding how to interact with the Cardano blockchain is crucial. This guide offers step-by-step instructions for a smooth experience.',
    },
    {
        title: 'IBC and Bridge Operator',
        description: 'Interoperability is key to realizing the full potential of Cardano. As a bridge operator, we facilitate connections between Cardano and other blockchains, creating a unified ecosystem.',
    },
    {
        title: 'Continual Improvement',
        description: 'We are committed to continual improvement in the Cardano ecosystem, focusing on enhancing products and services to better meet the needs of our community and drive innovation.',
    },
];

const Team = [{
        name: 'Alf',
        position: 'Founder',
        info: '2+ years of experience in Cardano development, system security, and leading DApp projects.',
        linkedin: '#',
    },
    {
        name: 'Tirs',
        position: 'Director of Operations',
        info: '5+ years of experience in project management and leadership within the blockchain space.',
        linkedin: '#',
    },
    {
        name: 'Elanarcy',
        position: 'Blockchain Specialist',
        info: '3+ years of experience in implementing and managing blockchain solutions on Cardano.',
        linkedin: '#',
    },
    {
        name: 'Alfin Sug',
        position: 'Fullstack Web3 Developer',
        info: '3+ years of experience in building decentralized applications on the Cardano blockchain.',
        linkedin: '#',
    },
    {
        name: 'Afif Abdillah',
        position: 'DevOps Manager',
        info: '3+ years of experience in managing and optimizing blockchain infrastructure on Cardano.',
        linkedin: '#',
    },
];

export default {
    Menu,
    CaseStudies,
    WorkingProcess,
    Team,
    ServicesData
};