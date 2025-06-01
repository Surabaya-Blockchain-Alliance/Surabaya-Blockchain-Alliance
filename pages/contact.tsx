// pages/contact.tsx or any other file
import dynamic from 'next/dynamic';

const ContactUs = dynamic(() => import('@/components/section/contact-us'), {
    ssr: false, // disables server-side rendering
});

export default function ContactPage() {
    return <ContactUs />;
}
