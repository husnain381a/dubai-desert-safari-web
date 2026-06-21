export const SITE = {
  name: "Red Sand Dunes DXB",
  tagline: "Luxury Desert Safari & City Tours in Dubai",
  description:
    "Premium desert safaris, luxury dune bashing, evening BBQ camps, dune buggies and Dubai city tours by Red Sand Dunes DXB.",
  whatsapp: "971582725970", // E.164 no +
  whatsappDisplay: "+971 58 272 5970",
  email: "info@redsanddunesdxb.com",
  phone: "+971 58 272 5970",
  address: "Trade Center First, Dubai, UAE",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.8636058280767!2d55.2706273!3d25.207821799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43005d25fb79%3A0xb4d1ebe1f32d26a2!2sRed%20Sand%20Dunes%20DXB!5e0!3m2!1sen!2s!4v1782072134466!5m2!1sen!2s",
  socials: {
    instagram: "https://www.instagram.com/redsanddunesdxb/",
    facebook: "https://www.facebook.com/profile.php?id=61589483815038",
    tiktok: "https://tiktok.com",
    youtube: "https://youtube.com",
  },
};

export const waLink = (msg?: string) =>
  `https://wa.me/${SITE.whatsapp}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
