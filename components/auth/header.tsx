import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Image from "next/image";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
});

interface HeaderProps {
  label: string;
};

export const Header = ({
  label
}: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <div className="flex items-center gap-x-2">
        <Image
          src="/icon.png"
          alt="Lock Icon"
          width={50}
          height={50}
          className="object-cover object-center"
        />
        <h1 className={cn("text-3xl font-semibold drop-shadow-lg", font.className)}>
          Lock Box
        </h1>
      </div>
      <p className="text-muted-foreground text-sm">
        {label}
      </p>
    </div>
  )
}