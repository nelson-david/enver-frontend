import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-bg-base p-4">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-40 left-1/2 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-accent-emerald/10 blur-[120px] opacity-60" />
                <div className="absolute top-1/3 right-1/4 h-[320px] w-[320px] rounded-full bg-accent-mint/8 blur-[100px] opacity-40" />
                <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-accent-emerald/10 blur-[110px] opacity-40" />
            </div>

            <div className="mb-8 flex flex-col items-center gap-2 select-none">
                <div className="flex items-center gap-1.5">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-lg bg-accent-emerald/30 blur-md opacity-70" />
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg">
                            <svg
                                width="18"
                                height="16"
                                viewBox="0 0 270 243"
                                fill="none"
                                className="text-bg-base"
                            >
                                <path
                                    d="M0 0 C49.5 0 99 0 150 0 C150 14.85 150 29.7 150 45 C122.61 45.33 95.22 45.66 67 46 C72.28 55.57 77.56 65.14 83 75 C85.64 79.785 88.28 84.57 91 89.5 C92.31871094 91.88992187 93.63742188 94.27984375 94.99609375 96.7421875 C97.67695862 101.60091395 100.35644473 106.46039858 103.03515625 111.3203125 C109.37923488 122.8292933 115.72819259 134.3356079 122.10128784 145.82855225 C123.02351536 147.49217491 123.94452393 149.15647311 124.86547852 150.82080078 C128.81560263 157.93714841 132.87224564 164.98524429 137 172 C137.60920288 170.89434692 137.60920288 170.89434692 138.23071289 169.76635742 C147.50300869 152.94107169 156.80324166 136.13178019 166.14111328 119.34277344 C169.26258349 113.7295386 172.3811369 108.1146837 175.5 102.5 C176.74998618 100.24999232 177.99998618 97.99999232 179.25 95.75 C179.86875 94.63625 180.4875 93.5225 181.125 92.375 C183 89 184.875 85.625 186.75 82.25 C187.36891113 81.13592773 187.98782227 80.02185547 188.62548828 78.87402344 C189.87375009 76.62721721 191.12212224 74.38047227 192.37060547 72.13378906 C195.52311379 66.46042553 198.67361316 60.78596278 201.8203125 55.109375 C211.1141431 38.34981348 220.47969833 21.63212607 230 5 C239.64710217 9.63452949 249.08797375 14.60294776 258.4375 19.8125 C259.46238525 20.37541748 260.48727051 20.93833496 261.54321289 21.51831055 C262.49703857 22.05496338 263.45086426 22.59161621 264.43359375 23.14453125 C265.71834595 23.86153198 265.71834595 23.86153198 267.02905273 24.59301758 C269 26 269 26 270 29 C269.12646484 31.17871094 269.12646484 31.17871094 267.7109375 33.734375 C266.92722778 35.16559692 266.92722778 35.16559692 266.12768555 36.62573242 C265.54929932 37.65674072 264.97091309 38.68774902 264.375 39.75 C263.48518433 41.36322144 263.48518433 41.36322144 262.57739258 43.0090332 C258.13585021 51.03786228 253.62074296 59.02624533 249.0871582 67.00341797 C244.68250678 74.75953428 240.36206262 82.56037933 236.0625 90.375 C230.4885 100.5039128 224.87454344 110.60892941 219.21679688 120.69140625 C213.07475815 131.63995546 206.98251809 142.61599602 200.89111328 153.59277344 C197.76254948 159.22951968 194.63113923 164.8646841 191.5 170.5 C190.24998618 172.74999232 188.99998618 174.99999232 187.75 177.25 C185.25 181.75 182.75 186.25 180.25 190.75 C179.6302832 191.86552246 179.01056641 192.98104492 178.37207031 194.13037109 C177.13194666 196.36252897 175.89171371 198.59462612 174.65136719 200.82666016 C171.72549548 206.09215071 168.80073335 211.35824851 165.87988281 216.62652588 C164.50214347 219.11136577 163.1237766 221.59585729 161.74536133 224.08032227 C160.77429027 225.83120364 159.80412565 227.58258765 158.83398438 229.33398438 C158.24423828 230.39681641 157.65449219 231.45964844 157.046875 232.5546875 C156.52963867 233.48780762 156.01240234 234.42092773 155.47949219 235.38232422 C154.99125977 236.24615723 154.50302734 237.10999023 154 238 C153.60015994 238.86658832 153.20031988 239.73317663 152.78836346 240.6260252 C151 243 151 243 148.27263355 243.61523914 C147.16187301 243.61063018 146.05111246 243.60602121 144.9066925 243.60127258 C143.63468396 243.60816007 142.36267542 243.61504755 141.05212116 243.62214375 C139.63410713 243.60440951 138.21609873 243.58622002 136.7980957 243.56762695 C135.28587248 243.56609555 133.77364567 243.56676228 132.26142406 243.56945324 C128.20665113 243.57058343 124.15261394 243.54157738 120.09801483 243.50640106 C116.29525905 243.47795409 112.49268343 243.47658709 108.68981934 243.47302246 C97.56394853 243.44677183 86.43821501 243.37696614 75.3125 243.3125 C50.459375 243.209375 25.60625 243.10625 0 243 C0 162.81 0 82.62 0 0 Z M45 104 C45 135.02 45 166.04 45 198 C62.16 198 79.32 198 97 198 C95.45300753 194.13251882 93.83535088 190.67039983 91.875 187.01953125 C91.25633057 185.86525635 90.63766113 184.71098145 90.00024414 183.52172852 C89.33367116 182.28522462 88.66691908 181.04881726 88 179.8125 C87.31170491 178.5325044 86.62347298 177.25247483 85.93530273 175.97241211 C81.59610603 167.91138019 77.20160302 159.88314068 72.73046875 151.89453125 C70.50835175 147.92175911 68.30834714 143.93698055 66.11328125 139.94921875 C65.59233635 139.00315514 65.59233635 139.00315514 65.06086731 138.03797913 C63.66265876 135.49846923 62.26454899 132.9589076 60.86843872 130.41824341 C56.00044873 121.56045853 51.03882418 112.76157495 46 104 C45.67 104 45.34 104 45 104 Z "
                                    fill="#6FE6B6"
                                />
                            </svg>
                        </div>
                    </div>
                    <span className="font-dm-sans text-[20px] font-bold tracking-tight text-text-primary">
                        Enver
                    </span>
                </div>
                <p className="font-dm-sans text-[13px] text-text-muted">
                    Secrets, environments, deployments — secured.
                </p>
            </div>

            <SignUp
                appearance={{
                    variables: {
                        colorPrimary: "#34d399",
                        colorSuccess: "#10b981",
                        colorWarning: "#fbbf24",
                        colorDanger: "#ef4444",
                        colorBackground: "transparent",
                        colorBorder: "rgba(255,255,255,0.08)",
                        fontFamily:
                            '"DM Sans", ui-sans-serif, system-ui, sans-serif',
                        fontFamilyButtons:
                            '"DM Sans", ui-sans-serif, system-ui, sans-serif',
                        fontWeight: {
                            normal: 450,
                            medium: 550,
                            bold: 700,
                        },
                        fontSize: {
                            sm: "0.8125rem",
                            lg: "1rem",
                            xl: "1.125rem",
                        },
                        spacing: "0.5rem",
                    },
                    elements: {
                        rootBox: "w-full max-w-[440px]",
                        card: "!bg-bg-card/85 !backdrop-blur-2xl !shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(110,231,183,0.06)] !rounded-t-xl !rounded-b-none !px-7 sm:!px-8 !pt-8 overflow-hidden relative",
                        main: "!px-0",
                        header: "!px-0 !pt-0.5 !pb-3",
                        headerTitle:
                            "!text-text-primary !font-dm-sans !text-[22px] !font-semibold !tracking-tight",
                        headerSubtitle:
                            "!text-text-secondary !font-dm-sans !text-[13.5px] !leading-relaxed !mt-1.5",
                        socialButtons: "!gap-3 !pb-2",
                        socialButtonsBlockButton:
                            "!h-11 !rounded-xl !bg-bg-subtle !hover:!bg-bg-card-hover !text-text-primary !border !border-border-subtle !transition-all !duration-200 !shadow-none !font-dm-sans !text-[13.5px] !font-medium",
                        socialButtonsBlockButtonText:
                            "!font-dm-sans !text-[13.5px] !font-medium",
                        socialButtonsIconButton:
                            "!h-11 !w-11 !rounded-xl !bg-bg-subtle !hover:!bg-bg-card-hover !border !border-border-subtle !text-text-primary !transition-all !duration-200",
                        dividerRow:
                            "!py-4 !before:!border-border-subtle !after:!border-border-subtle",
                        dividerLine: "!bg-border-subtle !opacity-80",
                        dividerText:
                            "!text-text-muted !font-dm-sans !text-[11px] !font-medium !tracking-[0.18em] !uppercase !px-4",
                        form: "!space-y-4",
                        formField: "!space-y-2",
                        formFieldLabel:
                            "!text-text-secondary !font-dm-sans !text-[12.5px] !font-medium !mb-1.5",
                        formFieldInput:
                            "!rounded-xl !bg-bg-subtle !text-text-primary !font-dm-sans !text-[13px] !border !border-border-subtle !hover:!border-border-light !placeholder:!text-text-muted !shadow-none !transition-all !duration-200 !h-[2.8rem] !max-h-[2.8rem] !px-3",
                        formFieldAction:
                            "!text-accent-mint !font-dm-sans !text-[12.5px] !font-medium !hover:!text-accent-emerald",
                        formFieldSuccessText:
                            "!text-accent-emerald !font-dm-sans !text-[12.5px]",
                        formFieldErrorText: "!font-dm-sans !text-[12.5px]",
                        formFieldWarningText: "!font-dm-sans !text-[12.5px]",
                        formResendCodeLink:
                            "!text-accent-mint !font-dm-sans !text-[12.5px] !font-medium !hover:!text-accent-emerald",
                        formButtonPrimary:
                            "!h-11 !rounded-xl !bg-accent-emerald-strong !hover:!bg-accent-emerald !text-text-primary !shadow-none !font-dm-sans !text-[13.5px] !font-semibold !tracking-tight !transition-all !duration-200 !-mt-1.5 !mb-4",
                        formButtonReset:
                            "!text-text-muted !font-dm-sans !text-[12.5px] !hover:!text-text-secondary",
                        otpCodeField: {
                            alignItems: "center",
                            justifyContent: "center",
                        },
                        otpCodeFieldInput:
                            "!h-12 !w-12 !rounded-xl !bg-bg-subtle !text-text-primary !text-[18px] !font-semibold !font-dm-mono !border !border-border-subtle !focus:!border-accent-emerald !focus:!shadow-[0_0_0_4px_rgba(52,211,153,0.15)] !transition-all !duration-200",
                        identityPreview:
                            "!rounded-xl !bg-bg-subtle !border !border-border-subtle !px-3 !py-2.5",
                        identityPreviewText:
                            "!text-text-secondary !font-dm-sans !text-[13px]",
                        identityPreviewEditButton:
                            "!text-accent-mint !font-dm-sans !text-[12px] !font-medium !hover:!text-accent-emerald",
                        footer: "!px-0 !pt-6 !pb-7",
                        footerActionText:
                            "!text-text-secondary !font-dm-sans !text-[13px]",
                        footerActionLink:
                            "!text-accent-mint !font-dm-sans !text-[13px] !font-semibold !tracking-tight !hover:!text-accent-emerald !transition-colors !duration-200",
                        footerPages: "!hidden",
                        badge: "!hidden",
                        alert: "!rounded-xl !font-dm-sans !text-[13px] !border",
                        alertWarning:
                            "!border-accent-mint/25 !bg-accent-mint/10 !text-accent-mint",
                        alertDanger:
                            "!border-red-500/25 !bg-red-500/10 !text-red-400",
                        pageScrollBox: "!bg-transparent",
                    },
                }}
            />

            <p className="mt-10 font-dm-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">
                © {new Date().getFullYear()} Enver · v0.1
            </p>
        </div>
    );
}
