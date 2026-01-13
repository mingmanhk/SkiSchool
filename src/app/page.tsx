
import Image from "next/image";

// TODO: Create the following components
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import Button from "@/components/Button";
// import ProgramCard from "@/components/ProgramCard";
// import TestimonialCard from "@/components/TestimonialCard";

export default function HomePage() {
  return (
    <div className="bg-gray-900 text-white">
      {/* <Navbar /> */}

      <main>
        {/* Hero Section */}
        <section className="relative h-[600px]">
          <Image
            src="/Mountain-Scene.jpg"
            alt="Ski resort with snow-covered mountains"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
              Experience the Thrill of the Slopes
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8">
              Join us at Cascade Ski School for an unforgettable winter adventure. We offer a wide range of programs for all ages and skill levels.
            </p>
            {/* <Button href="/programs">View Programs</Button> */}
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Our Programs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* <ProgramCard
                imgSrc="/path-to-your-image.jpg"
                title="Weekend Youth Ski Program"
                description="A fun and engaging program for kids to learn and improve their skiing skills."
              />
              <ProgramCard
                imgSrc="/path-to-your-image.jpg"
                title="Adult Group Lessons"
                description="Learn to ski or snowboard with our expert instructors in a supportive group environment."
              />
              <ProgramCard
                imgSrc="/path-to-your-image.jpg"
                title="Private Lessons"
                description="Get one-on-one instruction tailored to your specific needs and goals."
              /> */}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-800 py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              What Our Students Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {/*  <TestimonialCard
                quote="The instructors were amazing! My kids had a blast and learned so much in just one weekend."
                name="Sarah J."
                imgSrc="/path-to-avatar.jpg"
              />
              <TestimonialCard
                quote="I finally conquered my fear of snowboarding thanks to the patient and encouraging instructors at Cascade."
                name="Mike T."
                imgSrc="/path-to-avatar.jpg"
              />
              <TestimonialCard
                quote="A fantastic experience from start to finish. The staff was friendly, the lessons were well-organized, and the mountain was beautiful."
                name="Emily R."
                imgSrc="/path-to-avatar.jpg"
              /> */}
            </div>
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
