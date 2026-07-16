"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";


type Section = {
  heading: string;
  preview: string;
  fullText: string;
};


type MarkdownViewerProps = {
  sections: Record<string, Section[]>;

  expandedFiles: Set<string>;
  expandedSections: Set<string>;

  search: string;

  markdownComponents: any;

  displayCards: {
    type: "file" | "section";
    file: {
      name: string;
      slug: string;
      path: string;
    };
    section?: Section;
    idx?: number;
  }[];

  setExpandedSections: (
    value: React.SetStateAction<Set<string>>
  ) => void;

  setExpandedFiles: (
    value: React.SetStateAction<Set<string>>
  ) => void;
};


// highlight text
const Highlight = ({
  text,
  query,
}: {
  text: string;
  query: string;
}) => {

  if (!query) return <>{text}</>;


  const parts = text.split(
    new RegExp(`(${query})`, "gi")
  );


  return (
    <>
      {parts.map((part, index)=>
        part.toLowerCase() === query.toLowerCase()
        ?
        (
          <mark key={index}>
            {part}
          </mark>
        )
        :
        (
          part
        )
      )}
    </>
  );
};



export default function MarkdownViewer({

  sections,

  expandedFiles,
  expandedSections,

  search,

  markdownComponents,

  displayCards,

  setExpandedSections,
  setExpandedFiles,

}: MarkdownViewerProps) {



return (

<div className="space-y-4">


{
displayCards.length > 0

?

displayCards.map((card,idx)=>{


return (


<div key={idx}>


{
card.type === "file"

?


<div
id={card.file.slug}
className="
bg-gray-900
rounded-lg
p-4
border
border-gray-700
"
>


<h2
className="
text-xl
font-bold
mb-3
"
>

{card.file.name}

</h2>



<AnimatePresence>


{
expandedFiles.has(card.file.slug)
&&
sections[card.file.slug]
&&

(

<motion.div

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

className="space-y-3"

>


{
sections[card.file.slug].map(
(section,sectionIndex)=>{


const sectionId =
`${card.file.slug}-section-${sectionIndex}`;


return (

<div

key={sectionId}

id={sectionId}

className="
bg-gray-800
p-3
rounded-lg
cursor-pointer
"

onClick={()=>{


setExpandedSections(prev=>{

const next = new Set(prev);


if(next.has(sectionId)){
next.delete(sectionId);
}
else{
next.add(sectionId);
}


return next;

});


}}

>


<h4
className="
font-semibold
flex
justify-between
items-center
"
>

<Highlight
text={section.heading}
query={search}
/>


{
expandedSections.has(sectionId)

?

<ChevronDown size={16}/>

:

<ChevronRight size={16}/>

}


</h4>



<AnimatePresence>


{
expandedSections.has(sectionId)

&&

(

<motion.div

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
mt-3
text-sm
text-gray-200
"

>


<ReactMarkdown

components={markdownComponents}

remarkPlugins={[
remarkGfm
]}

>

{section.fullText}

</ReactMarkdown>


</motion.div>

)

}


</AnimatePresence>


</div>


);


}

)

}



</motion.div>

)

}


</AnimatePresence>


</div>


:




<div

id={`${card.file.slug}-section-${card.idx}`}

className="
bg-gray-900
p-4
rounded-lg
border
border-gray-700
"

>


<h3 className="text-lg font-bold">

<Highlight

text={card.section!.heading}

query={search}

/>

</h3>



<p className="
text-gray-300
mb-3
">

<Highlight

text={card.section!.preview}

query={search}

/>

</p>



<ReactMarkdown

components={markdownComponents}

remarkPlugins={[
remarkGfm
]}

>

{card.section!.fullText}

</ReactMarkdown>


</div>


}


</div>


);


})


:

(

<p className="text-gray-400">
No results found.
</p>

)

}


</div>

);


}