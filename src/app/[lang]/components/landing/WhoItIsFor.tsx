
export default function WhoItIsFor() {
  const audiences = [
    { name: "Youth Schools", icon: "🎿" },
    { name: "Race Teams", icon: "⏱️" },
    { name: "Seasonal Programs", icon: "❄️" },
    { name: "Camps & Clinics", icon: "🏕️" },
  ]

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Built for Programs Like Yours</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Ski School OS is flexible enough to handle the unique needs of any ski or snowboard program.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {audiences.map((item, index) => (
            <div key={index} className="flex flex-col items-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-4xl mb-4">
                {item.icon}
              </div>
              <span className="font-semibold text-lg text-gray-800 dark:text-white text-center">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
