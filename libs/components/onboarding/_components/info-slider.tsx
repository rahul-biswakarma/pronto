export const InfoSlider = () => {
    return (
        <section className="flex justify-center items-center w-full min-h-[300px] bg-[#E7E7E7] my-12 relative overflow-hidden p-5">
            <div className="grid grid-cols-2 w-full max-w-7xl items-center">
                <div className="">
                    <h2 className="text-3xl font-medium">
                        Your resume shows what you’ve done <br />
                        Your portfolio shows{" "}
                        <span className="font-italianno font-medium text-6xl">
                            who you are
                        </span>
                        .
                    </h2>
                    <p>
                        Turn static PDFs into stunning digital profiles — in
                        minutes
                    </p>
                </div>
                <img
                    className="!w-[400px]"
                    src="/social.png"
                    alt="info-slider"
                />
            </div>
        </section>
    );
};
