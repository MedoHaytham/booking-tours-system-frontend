

export default function TourCardLoading({ length, isHome }) {
    return (
      <>
        {Array.from({ length }).map((_, i) => (
          <div key={i} className={`rounded-xl  ${isHome ? "w-70 xl:w-80" : ""} overflow-hidden shadow-card`}>
            {/* image */}
            <div className="skeleton h-52 w-full" />
            {/* body */}
            <div className="p-6 space-y-4">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
              <div className="flex justify-between pt-2">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </>
    )
}