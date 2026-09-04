import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kowsik Y — AI & ML Engineer Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: "linear-gradient(to bottom right, #09090b, #18181b)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: -200,
                        right: -200,
                        width: 600,
                        height: 600,
                        background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0,0,0,0) 70%)",
                        borderRadius: "50%",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: -200,
                        left: -200,
                        width: 600,
                        height: 600,
                        background: "radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, rgba(0,0,0,0) 70%)",
                        borderRadius: "50%",
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 20,
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            fontSize: 80,
                            fontWeight: 800,
                            color: "white",
                            letterSpacing: "-0.05em",
                            lineHeight: 1,
                        }}
                    >
                        Kowsik Y
                    </div>
                    
                    <div
                        style={{
                            fontSize: 40,
                            color: "#a1a1aa", // text-muted-foreground
                            fontWeight: 500,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        AI & ML Engineer
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            marginTop: 40,
                            paddingTop: 40,
                            borderTop: "2px solid rgba(255, 255, 255, 0.1)",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 28,
                                color: "#8b5cf6", // violet-500
                                fontWeight: 600,
                            }}
                        >
                            kowsik.me
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
