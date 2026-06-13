export const SITE = {
  name: "Red Sand Dunes DXB",
  tagline: "Luxury Desert Safari & City Tours in Dubai",
  description:
    "Premium desert safaris, luxury dune bashing, evening BBQ camps, dune buggies and Dubai city tours by Red Sand Dunes DXB.",
  whatsapp: "971582725970", // E.164 no +
  whatsappDisplay: "+971 58 272 5970",
  email: "info@redsanddunesdxb.com",
  phone: "+971 58 272 5970",
  address: "Business Bay, Dubai, UAE",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28884.93785936424!2d55.2718197!3d25.1823992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f682def25f457%3A0x3dd4c4097970950e!2sBusiness%20Bay%20-%20Dubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2s!4v1781345532879!5m2!1sen!2s",
  socials: {
    instagram: "https://www.instagram.com/redsanddunesdxb/",
    facebook: "https://www.facebook.com/profile.php?id=61589483815038",
    tiktok: "https://tiktok.com",
    youtube: "https://youtube.com",
  },
};

export const waLink = (msg?: string) =>
  `https://wa.me/${SITE.whatsapp}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
