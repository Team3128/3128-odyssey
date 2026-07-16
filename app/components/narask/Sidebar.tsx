"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type MdFile = {
  name: string;
  slug: string;
  path: string;
};

type Section = {
  heading: string;
  preview: string;
  fullText: string;
};

type SidebarProps = {
  mdFiles: MdFile[];
  sections: Record<string, Section[]>;

  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;

  openDropdown: string | null;
  setOpenDropdown: (value: string | null) => void;

  setActiveFilter: (value: string | null) => void;

  setExpandedFiles: (
    value: React.SetStateAction<Set<string>>
  ) => void;

  setExpandedSections: (
    value: React.SetStateAction<Set<string>>
  ) => void;

  sidebarRef: React.RefObject<HTMLDivElement | null>;
};


export default function Sidebar({
  mdFiles,
  sections,

  menuOpen,
  setMenuOpen,

  openDropdown,
  setOpenDropdown,

  setActiveFilter,
  setExpandedFiles,
  setExpandedSections,

  sidebarRef,

}: SidebarProps) {


  return (

    <aside
      ref={sidebarRef}
      className={`
        fixed
        top-0
        left-0
        h-full
        w-72
        bg-black
        p-6
        z-50
        overflow-y-auto
        transform
        transition-transform
        duration-500
        ${
          menuOpen
          ? "translate-x-0"
          : "-translate-x-full"
        }
      `}
    >

      <h3 className="text-lg font-semibold mb-4">
        Documentation
      </h3>


      {mdFiles.map((file)=>(

        <div
          key={file.slug}
          className="mb-4"
        >


          <button

            className="
              flex
              items-center
              justify-between
              w-full
              text-left
              font-semibold
              py-2
              hover:text-blue-400
            "

            onClick={()=>{

              setActiveFilter(file.slug);

              setExpandedFiles(prev=>{
                const next = new Set(prev);
                next.add(file.slug);
                return next;
              });


              setOpenDropdown(
                openDropdown === file.slug
                ? null
                : file.slug
              );

            }}

          >

            {file.name}


            {
              openDropdown === file.slug

              ?

              <ChevronDown size={16}/>

              :

              <ChevronRight size={16}/>

            }


          </button>



          <AnimatePresence>

            {
              openDropdown === file.slug &&
              sections[file.slug] &&

              (

                <motion.ul

                  initial={{
                    height:0,
                    opacity:0
                  }}

                  animate={{
                    height:"auto",
                    opacity:1
                  }}

                  exit={{
                    height:0,
                    opacity:0
                  }}

                  className="
                    pl-4
                    mt-2
                    space-y-2
                    text-gray-300
                  "

                >


                  {
                    sections[file.slug].map(
                      (section,index)=>(

                      <li

                        key={index}

                        className="
                          cursor-pointer
                          hover:text-blue-400
                          text-sm
                        "


                        onClick={()=>{


                          const sectionId =
                            `${file.slug}-section-${index}`;


                          setActiveFilter(file.slug);


                          setExpandedFiles(prev=>{
                            const next = new Set(prev);
                            next.add(file.slug);
                            return next;
                          });


                          setExpandedSections(prev=>{
                            const next = new Set(prev);
                            next.add(sectionId);
                            return next;
                          });



                          setTimeout(()=>{

                            document
                              .getElementById(sectionId)
                              ?.scrollIntoView({
                                behavior:"smooth",
                                block:"start"
                              });

                          },100);
                        }}
                      >
                        {section.heading}
                      </li>
                    ))
                  }
                </motion.ul>
              )
            }
          </AnimatePresence>
        </div>
      ))}

    </aside>
  );

}