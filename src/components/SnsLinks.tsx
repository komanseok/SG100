"use client";

const snsItems = [
  {
    href: "https://www.youtube.com/channel/UCrSm4WWIjWMCyX32GOsS-dQ",
    label: "YouTube",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 461.001 461.001">
        <path fill="#F61C0D" d="M365.257 67.393H95.744C42.866 67.393 0 110.259 0 163.137v134.728c0 52.878 42.866 95.744 95.744 95.744h269.513c52.878 0 95.744-42.866 95.744-95.744V163.137c0-52.878-42.866-95.744-95.744-95.744zm-73.024 166.09-122.639 63.656c-3.264 1.694-7.148-.475-7.148-4.003V168.13c0-3.569 3.96-5.72 7.206-3.913l122.639 68.218c3.573 1.99 3.526 7.14-.058 9.048z"/>
      </svg>
    ),
  },
  {
    href: "https://facebook.com/jeongbong.joo",
    label: "Facebook",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 512 512">
        <path fill="#1877F2" d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256c0 120.5 83.2 221.6 195.2 249.1V334.2h-54.6V256h54.6v-33.7c0-81.1 36.1-120.3 117.9-120.3 15.3 0 41.7 3 52.5 6v70.2c-5.7-.6-15.6-.9-27.9-.9-39.6 0-54.9 15-54.9 54.1V256h79.1l-13.6 78.2h-65.5v176.9C420.7 488.1 512 381.5 512 256z"/>
      </svg>
    ),
  },
  {
    href: "https://m.blog.naver.com/victory0603jb",
    label: "Naver Blog",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 512 512">
        <path fill="#03C75A" d="M9.067 0C4.067 0 0 4.067 0 9.067v493.867C0 507.933 4.067 512 9.067 512h493.867c5 0 9.067-4.067 9.067-9.067V9.067C512 4.067 507.933 0 502.933 0H9.067z"/>
        <path fill="#fff" d="M291.67 259.33 215.57 153.6h-56.37v204.8h61.13V252.67L296.43 358.4h56.37V153.6H291.67v105.73z"/>
      </svg>
    ),
  },
  {
    href: "https://instagram.com/joojeongbong",
    label: "Instagram",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 551.034 551.034">
        <linearGradient id="ig" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#FFC107"/>
          <stop offset="50%" stopColor="#F44336"/>
          <stop offset="100%" stopColor="#9C27B0"/>
        </linearGradient>
        <path fill="url(#ig)" d="M386.878 0H164.156C73.64 0 0 73.64 0 164.156v222.722c0 90.516 73.64 164.156 164.156 164.156h222.722c90.516 0 164.156-73.64 164.156-164.156V164.156C551.034 73.64 477.394 0 386.878 0zM495.6 386.878c0 60.045-48.677 108.722-108.722 108.722H164.156c-60.045 0-108.722-48.677-108.722-108.722V164.156c0-60.046 48.677-108.722 108.722-108.722h222.722c60.045 0 108.722 48.676 108.722 108.722v222.722z"/>
        <path fill="url(#ig)" d="M275.517 133C196.933 133 133 196.933 133 275.517s63.933 142.517 142.517 142.517S418.034 354.1 418.034 275.517 354.1 133 275.517 133zm0 229.6c-48.095 0-87.083-38.988-87.083-87.083s38.989-87.083 87.083-87.083c48.095 0 87.083 38.988 87.083 87.083 0 48.094-38.989 87.083-87.083 87.083z"/>
        <circle fill="url(#ig)" cx="418.31" cy="134.07" r="34.15"/>
      </svg>
    ),
  },
];

export function SnsLinks({ size = "md" }: { size?: "sm" | "md" }) {
  const iconSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";

  return (
    <div className="flex items-center gap-5">
        {snsItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
            aria-label={item.label}
          >
            <span className={`${iconSize} inline-block`}>{item.icon}</span>
          </a>
        ))}
    </div>
  );
}
