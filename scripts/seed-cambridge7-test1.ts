// scripts/seed-cambridge7-test1.ts
// Run: npx ts-node scripts/seed-cambridge7-test1.ts
// Or paste into browser console after importing api client

import { ReadingTestCreate } from "@/lib/api/ielts_reading";
import { adminCreateTest } from "../lib/api/ielts_reading";

const payload: ReadingTestCreate = {
  global_title: "Cambridge 7_Test 1",
  is_active: true,
  parts: [
    // ══════════════════════════════════════════════════════════════════
    // PART 1 — Let's Go Bats
    // ══════════════════════════════════════════════════════════════════
    {
      part: 1,
      title: "Let's Go Bats",
      time_limit_minutes: 20,
      difficulty: "MEDIUM",
      is_active: true,
      total_questions: 13,
      content: `A
Bats have a problem: how to find their way around in the dark.They hunt at night, and cannot use light to help them find prey and avoid obstacles.You might say that this is a problem of their own making, one that they could avoid simply by changing their habits and hunting by day.But the daytime economy is already heavily exploited by other creatures such as birds.Given that there is a living to be made at night, and given that alternative daytime trades are thoroughly occupied, natural selection has favoured bats that make a go of the night-hunting trade.It is probable that the nocturnal trades go way back in the ancestry of all mammals.In the time when the dinosaurs dominated the daytime economy, our mammalian ancestors probably only managed to survive at all because they found ways of scraping a living at night.Only after the mysterious mass extinction of the dinosaurs about 65 million years ago were our ancestors able to emerge into the daylight in any substantial numbers.

B
Bats have an engineering problem: how to find their way and find their prey in the absence of light.Bats are not the only creatures to face this difficulty today.Obviously the night-flying insects that they prey on must find their way about somehow.Deep-sea fish and whales have little or no light by day or by night.Fish and dolphins that live in extremely muddy water cannot see because, although there is light, it is obstructed and scattered by the dirt in the water.Plenty of other modern animals make their living in conditions where seeing is difficult or impossible.

C
Given the questions of how to manoeuvre in the dark, what solutions might an engineer consider?The first one that might occur to him is to manufacture light, to use a lantern or a searchlight.Fireflies and some fish (usually with the help of bacteria) have the power to manufacture their own light, but the process seems to consume a large amount of energy.Fireflies use their light for attracting mates.This doesn't require a prohibitive amount of energy: a male's tiny pinprick of light can be seen by a female from some distance on a dark night, since her eyes are exposed directly to the light source itself.However, using light to find one's own way around requires vastly more energy, since the eyes have to detect the tiny fraction of the light that bounces off each part of the scene.The light source must therefore be immensely brighter if it is to be used as a headlight to illuminate the path, than if it is to be used as a signal to others.In any event, whether or not the reason is the energy expense, it seems to be the case that, with the possible exception of some weird deep-sea fish, no animal apart from man uses manufactured light to find its way about.

D
What else might the engineer think of?Well, blind humans sometimes seem to have an uncanny sense of obstacles in their path.It has been given the name 'facial vision', because blind people have reported that it feels a bit like the sense of touch, on the face.One report tells of a totally blind boy who could ride his tricycle at good speed round the block near his home, using facial vision.Experiments showed that, in fact, facial vision is nothing to do with touch or the front of the face, although the sensation may be referred to the front of the face, like the referred pain in a phantom limb.The sensation of facial vision, it turns out, really goes in through the ears.Blind people, without even being aware of the fact, are actually using echoes of their own footsteps and of other sounds, to sense the presence of obstacles.Before this was discovered, engineers had already built instruments to exploit the principle, for example to measure the depth of the sea under a ship.After this technique had been invented, it was only a matter of time before weapons designers adapted it for the detection of submarines.Both sides in the Second world war relied heavily on these devices, under such codenames as Asdic (British) and Sonar (American), as well as Radar (American) or RDF (British), which uses radio echoes rather than sound echoes.

E
The Sonar and Radar pioneers didn't know it then, but all the world now knows that bats, or rather natural selection working on bats, had perfected the system tens of millions of years earlier, and their 'radar' achieves feats of detection and navigation that would strike an engineer dumb with admiration.It is technically incorrect to talk about bat 'radar', since they do not use radio waves.It is sonar.But the underlying mathematical theories of radar and sonar are very similar, and much of our scientific understanding of the details of what bats are doing has come from applying radar theory to them.The American zoologist Donald Griffin, who was largely responsible for the discovery of sonar in bats, coined the term 'echolocation' to cover both sonar and radar, whether used by animals or by human instruments.`,
      question_groups: [
        // ── Group 1: MATCHING_INFORMATION (Q1–5) ──────────────────────
        {
          question_number: 1,
          type: "MATCHING_INFORMATION",
          instruction:
            "<p>Reading Passage 1&nbsp;has&nbsp;five&nbsp;paragraphs. Which paragraph contains the following information?</p><p><br></p><p><strong><em>NB</em></strong><em>&nbsp;You may use any letter more than once.</em></p>",
          question_text: "----",
          context: null,
          points: 1,
          is_active: true,
          options: [
            {
              option_key: "A",
              option_text: "",
              is_correct: false,
              order_index: 0,
            },
            {
              option_key: "B",
              option_text: "",
              is_correct: false,
              order_index: 1,
            },
            {
              option_key: "C",
              option_text: "",
              is_correct: false,
              order_index: 2,
            },
            {
              option_key: "D",
              option_text: "",
              is_correct: false,
              order_index: 3,
            },
            {
              option_key: "E",
              option_text: "",
              is_correct: false,
              order_index: 4,
            },
          ],
          sub_questions: [
            {
              question_number: 1,
              question_text:
                "examples of wildlife other than bats which do not rely on vision to navigate by",
              correct_answer: "B",
              explanation:
                "Paragraph B provides examples of wildlife that do not rely on vision to navigate, such as deep-sea fish, whales, and night-flying insects.",
              from_passage:
                "Obviously the night-flying insects that they prey on must find their way about somehow.Deep-sea fish and whales have little or no light by day or by night.Fish and dolphins that live in extremely muddy water cannot see because, although there is light, it is obstructed and scattered by the dirt in the water.",
              points: 1,
            },
            {
              question_number: 2,
              question_text: "how early mammals avoided dying out",
              correct_answer: "A",
              explanation:
                "Paragraph A explains how early mammals, during the time when dinosaurs dominated, likely survived by being nocturnal and avoiding the daytime economy.",
              from_passage:
                "In the time when the dinosaurs dominated the daytime economy, our mammalian ancestors probably only managed to survive at all because they found ways of scraping a living at night.",
              points: 1,
            },
            {
              question_number: 3,
              question_text: "why bats hunt in the dark",
              correct_answer: "A",
              explanation:
                "Paragraph A explains why bats hunt at night, noting that the daytime economy is already heavily exploited by other creatures like birds, leaving bats to exploit the nighttime economy.",
              from_passage:
                "But the daytime economy is already heavily exploited by other creatures such as birds.Given that there is a living to be made at night, and given that alternative daytime trades are thoroughly occupied, natural selection has favoured bats that make a go of the night-hunting trade.",
              points: 1,
            },
            {
              question_number: 4,
              question_text:
                "how a particular discovery has helped our understanding of bats",
              correct_answer: "E",
              explanation:
                "Paragraph E talks about how the discovery of bat sonar helped scientists understand the system used by bats, comparing it to radar.",
              from_passage:
                "The American zoologist Donald Griffin, who was largely responsible for the discovery of sonar in bats, coined the term 'echolocation' to cover both sonar and radar, whether used by animals or by human instruments.",
              points: 1,
            },
            {
              question_number: 5,
              question_text: "early military uses of echolocation",
              correct_answer: "D",
              explanation:
                "Paragraph D explains how sonar and radar were adapted during wartime for detecting submarines, highlighting early military uses of echolocation.",
              from_passage:
                "After this technique had been invented, it was only a matter of time before weapons designers adapted it for the detection of submarines.",
              points: 1,
            },
          ],
        },

        // ── Group 2: SUMMARY_COMPLETION (Q6–9) ───────────────────────
        {
          question_number: 6,
          type: "SUMMARY_COMPLETION",
          instruction:
            "<p>Complete the summary below. Write&nbsp;<strong>ONE WORD ONLY</strong>&nbsp;from the passage for each answer.</p>",
          question_text:
            "<p><strong>                                                                           Facial Vision</strong></p><p>Blind people report that so-called 'facial vision' is comparable to the sensation of touch on the face. In fact, the sensation is more similar to the way in which pain from a ______  arm or leg might be felt.</p><p><br></p><p>The ability actually comes from perceiving ______  through the ears. However, even before this was understood, the principle had been applied in the design of instruments which calculated the ______ of the seabed. This was followed by a wartime application in devices for finding ______ .</p>",
          context: null,
          points: 1,
          is_active: true,
          options: [],
          sub_questions: [
            {
              question_number: 6,
              question_text: "",
              correct_answer: "phantom",
              explanation:
                "The passage explains that facial vision in blind people is similar to the sensation of pain felt from a phantom limb.",
              from_passage:
                "Experiments showed that, in fact, facial vision is nothing to do with touch or the front of the face, although the sensation may be referred to the front of the face, like the referred pain in a phantom limb.",
              points: 1,
            },
            {
              question_number: 7,
              question_text: "",
              correct_answer: "echoes",
              explanation:
                "The passage explains that blind people use echoes of sounds, such as their footsteps, to sense obstacles in their path.",
              from_passage:
                "Blind people, without even being aware of the fact, are actually using echoes of their own footsteps and of other sounds, to sense the presence of obstacles.",
              points: 1,
            },
            {
              question_number: 8,
              question_text: "",
              correct_answer: "depth",
              explanation:
                "The passage mentions that instruments based on the principle of facial vision were designed to measure the depth of the sea.",
              from_passage:
                "Before this was discovered, engineers had already built instruments to exploit the principle, for example to measure the depth of the sea under a ship.",
              points: 1,
            },
            {
              question_number: 9,
              question_text: "",
              correct_answer: "submarines",
              explanation:
                "The passage highlights how wartime applications of echolocation technology were used to detect submarines.",
              from_passage:
                "After this technique had been invented, it was only a matter of time before weapons designers adapted it for the detection of submarines.",
              points: 1,
            },
          ],
        },

        // ── Group 3: SENTENCE_COMPLETION (Q10–13) ────────────────────
        {
          question_number: 10,
          type: "SENTENCE_COMPLETION",
          instruction:
            "<p>Complete the sentences below. Write&nbsp;<strong>NO MORE THAN TWO WORDS</strong>&nbsp;from the passage for each answer.</p>",
          question_text:
            "<p><br></p><p>• Long&nbsp;before&nbsp;the&nbsp;invention&nbsp;of&nbsp;radar, ______ had&nbsp;resulted&nbsp;in&nbsp;a&nbsp;sophisticated&nbsp;radar-like&nbsp;system&nbsp;in&nbsp;bats.</p><p>• Radar&nbsp;is&nbsp;an&nbsp;inaccurate&nbsp;term&nbsp;when&nbsp;referring&nbsp;to&nbsp;bats&nbsp;because ______ are&nbsp;not&nbsp;used&nbsp;in&nbsp;their&nbsp;navigation&nbsp;system.</p><p>• Radar&nbsp;and&nbsp;sonar&nbsp;are&nbsp;based&nbsp;on&nbsp;similar ______ .</p><p>• The&nbsp;word&nbsp;'echolocation'&nbsp;was&nbsp;first&nbsp;used&nbsp;by&nbsp;someone&nbsp;working&nbsp;as&nbsp;a ______ .</p>",
          context: null,
          points: 1,
          is_active: true,
          options: [],
          sub_questions: [
            {
              question_number: 10,
              question_text: "",
              correct_answer: "natural selection",
              explanation:
                "The passage suggests that natural selection, not human invention, led to the development of bats' sonar-like navigation system.",
              from_passage:
                "The Sonar and Radar pioneers didn't know it then, but all the world now knows that bats, or rather natural selection working on bats, had perfected the system tens of millions of years earlier.",
              points: 1,
            },
            {
              question_number: 11,
              question_text: "",
              correct_answer: "radio waves",
              explanation:
                "The passage explains that although bats' echolocation system is similar to radar, bats do not use radio waves for navigation.",
              from_passage:
                "It is technically incorrect to talk about bat 'radar', since they do not use radio waves.",
              points: 1,
            },
            {
              question_number: 12,
              question_text: "",
              correct_answer: "mathematical theories",
              explanation:
                "The passage compares the underlying mathematical theories of radar and sonar.",
              from_passage:
                "But the underlying mathematical theories of radar and sonar are very similar, and much of our scientific understanding of the details of what bats are doing has come from applying radar theory to them.",
              points: 1,
            },
            {
              question_number: 13,
              question_text: "",
              correct_answer: "zoologist",
              explanation:
                "The passage states that zoologist Donald Griffin was largely responsible for discovering sonar in bats and coining the term 'echolocation'.",
              from_passage:
                "The American zoologist Donald Griffin, who was largely responsible for the discovery of sonar in bats, coined the term 'echolocation' to cover both sonar and radar, whether used by animals or by human instruments.",
              points: 1,
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // PART 2 — MAKING EVERY DROP COUNT
    // ══════════════════════════════════════════════════════════════════
    {
      part: 2,
      title: "MAKING EVERY DROP COUNT",
      time_limit_minutes: 20,
      difficulty: "MEDIUM",
      is_active: true,
      total_questions: 13,
      content: `[HEADING: A]
The history of human civilisation is entwined with the history of the ways we have learned to manipulate water resources.As towns gradually expanded, water was brought from increasingly remote sources, leading to sophisticated engineering efforts such as dams and aqueducts.At the height of the Roman Empire, nine major systems, with an innovative layout of pipes and well-built sewers, supplied the occupants of Rome with as much water per person as is provided in many parts of the industrial world today.

B
During the industrial revolution and population explosion of the 19th and 20th centuries, the demand for water rose dramatically.Unprecedented construction of tens of thousands of monumental engineering projects designed to control floods, protect clean water supplies, and provide water for irrigation and hydropower brought great benefits to hundreds of millions of people.Food production has kept pace with soaring populations mainly because of the expansion of artificial irrigation systems that make possible the growth of 40 % of the world's food.Nearly one fifth of all the electricity generated worldwide is produced by turbines spun by the power of falling water.

[HEADING: C]
Yet there is a dark side to this picture: despite our progress, half of the world's population still suffers, with water services inferior to those available to the ancient Greeks and Romans.As the United Nations report on access to water reiterated in November 2001, more than one billion people lack access to clean drinking water; some two and a half billion do not have adequate sanitation services.Preventable water-related diseases kill an estimated 10,000 to 20,000 children every day, and the latest evidence suggests that we are falling behind in efforts to solve these problems.

[HEADING: D]
The consequences of our water policies extend beyond jeopardising human health.Tens of millions of people have been forced to move from their homes - often with little warning or compensation - to make way for the reservoirs behind dams.More than 20 % of all freshwater fish species are now threatened or endangered because dams and water withdrawals have destroyed the free-flowing river ecosystems where they thrive.Certain irrigation practices degrade soil quality and reduce agricultural productivity.Groundwater aquifers are being pumped down faster than they are naturally replenished in parts of India, China, the USA and elsewhere.And disputes over shared water resources have led to violence and continue to raise local, national and even international tensions.

[HEADING: E]
At the outset of the new millennium, however, the way resource planners think about water is beginning to change.The focus is slowly shifting back to the provision of basic human and environmental needs as top priority - ensuring 'some for all', instead of 'more for some'.Some water experts are now demanding that existing infrastructure be used in smarter ways rather than building new facilities, which is increasingly considered the option of last, not first, resort.This shift in philosophy has not been universally accepted, and it comes with strong opposition from some established water organisations.Nevertheless, it may be the only way to address successfully the pressing problems of providing everyone with clean water to drink, adequate water to grow food and a life free from preventable water-related illness.

[HEADING: F]
Fortunately - and unexpectedly - the demand for water is not rising as rapidly as some predicted.As a result, the pressure to build new water infrastructures has diminished over the past two decades.Although population, industrial output and economic productivity have continued to soar in developed nations, the rate at which people withdraw water from aquifers, rivers and lakes has slowed.And in a few parts of the world, demand has actually fallen.

[HEADING: G]
What explains this remarkable turn of events?Two factors: people have figured out how to use water more efficiently, and communities are rethinking their priorities for water use.Throughout the first three-quarters of the 20th century, the quantity of freshwater consumed per person doubled on average; in the USA, water withdrawals increased tenfold while the population quadrupled.But since 1980, the amount of water consumed per person has actually decreased, thanks to a range of new technologies that help to conserve water in homes and industry.In 1965, for instance, Japan used approximately 13 million gallons of water to produce $1 million of commercial output; by 1989 this had dropped to 3.5 million gallons (even accounting for inflation) - almost a quadrupling of water productivity.In the USA, water withdrawals have fallen by more than 20 % from their peak in 1980.

[HEADING: H]
On the other hand, dams, aqueducts and other kinds of infrastructure will still have to be built, particularly in developing countries where basic human needs have not been met.But such projects must be built to higher specifications and with more accountability to local people and their environment than in the past.And even in regions where new projects seem warranted, we must find ways to meet demands with fewer resources, respecting ecological criteria and to a smaller budget.`,
      question_groups: [
        // ── Group 4: MATCHING_HEADINGS (Q14–20) ──────────────────────
        {
          question_number: 14,
          type: "MATCHING_HEADINGS",
          instruction:
            "<p>Reading Passage 2&nbsp;has&nbsp;eight&nbsp;paragraphs. Choose the correct heading for each paragraph from the list of headings below.</p>",
          question_text: "----",
          context: null,
          points: 1,
          is_active: true,
          options: [
            {
              option_key: "A",
              option_text: "Scientists' call for a revision of policy",
              is_correct: false,
              order_index: 0,
            },
            {
              option_key: "B",
              option_text: "An explanation for reduced water use",
              is_correct: false,
              order_index: 1,
            },
            {
              option_key: "C",
              option_text: "How a global challenge was met",
              is_correct: false,
              order_index: 2,
            },
            {
              option_key: "D",
              option_text: "Irrigation systems fall into disuse",
              is_correct: false,
              order_index: 3,
            },
            {
              option_key: "E",
              option_text: "Environmental effects",
              is_correct: false,
              order_index: 4,
            },
            {
              option_key: "F",
              option_text:
                "The financial cost of recent technological improvements",
              is_correct: false,
              order_index: 5,
            },
            {
              option_key: "G",
              option_text: "The relevance to health",
              is_correct: false,
              order_index: 6,
            },
            {
              option_key: "H",
              option_text: "Addressing the concern over increasing populations",
              is_correct: false,
              order_index: 7,
            },
            {
              option_key: "I",
              option_text: "A surprising downward trend in demand for water",
              is_correct: false,
              order_index: 8,
            },
            {
              option_key: "J",
              option_text: "The need to raise standards",
              is_correct: false,
              order_index: 9,
            },
            {
              option_key: "K",
              option_text: "A description of ancient water supplies",
              is_correct: false,
              order_index: 10,
            },
          ],
          sub_questions: [
            {
              question_number: 14,
              question_text: "",
              correct_answer: "K",
              explanation:
                "Paragraph A describes the history of water management, focusing on ancient efforts such as Roman aqueducts.",
              from_passage:
                "At the height of the Roman Empire, nine major systems, with an innovative layout of pipes and well-built sewers, supplied the occupants of Rome with as much water per person as is provided in many parts of the industrial world today.",
              points: 1,
            },
            {
              question_number: 15,
              question_text: "",
              correct_answer: "G",
              explanation:
                "Paragraph C discusses the inadequacies of water services today and highlights the health consequences.",
              from_passage:
                "Preventable water-related diseases kill an estimated 10,000 to 20,000 children every day, and the latest evidence suggests that we are falling behind in efforts to solve these problems.",
              points: 1,
            },
            {
              question_number: 16,
              question_text: "",
              correct_answer: "E",
              explanation:
                "Paragraph D outlines the environmental effects of water policies.",
              from_passage:
                "More than 20 % of all freshwater fish species are now threatened or endangered because dams and water withdrawals have destroyed the free-flowing river ecosystems where they thrive.",
              points: 1,
            },
            {
              question_number: 17,
              question_text: "",
              correct_answer: "A",
              explanation:
                "Paragraph E discusses how the philosophy of water resource management is beginning to shift.",
              from_passage:
                "The focus is slowly shifting back to the provision of basic human and environmental needs as top priority - ensuring 'some for all', instead of 'more for some'.",
              points: 1,
            },
            {
              question_number: 18,
              question_text: "",
              correct_answer: "I",
              explanation:
                "Paragraph F discusses the surprising downward trend in demand for water.",
              from_passage:
                "Fortunately - and unexpectedly - the demand for water is not rising as rapidly as some predicted.",
              points: 1,
            },
            {
              question_number: 19,
              question_text: "",
              correct_answer: "B",
              explanation:
                "Paragraph G explains why the reduction in water use per person has occurred.",
              from_passage:
                "Two factors: people have figured out how to use water more efficiently, and communities are rethinking their priorities for water use.",
              points: 1,
            },
            {
              question_number: 20,
              question_text: "",
              correct_answer: "J",
              explanation:
                "Paragraph H discusses the need for new infrastructure but stresses higher accountability and ecological standards.",
              from_passage:
                "But such projects must be built to higher specifications and with more accountability to local people and their environment than in the past.",
              points: 1,
            },
          ],
        },

        // ── Group 5: YES_NO_NOT_GIVEN (Q21–26) ───────────────────────
        {
          question_number: 21,
          type: "YES_NO_NOT_GIVEN",
          instruction:
            "<p>Choose <strong>YES </strong>if the statement agrees with the information given in the text, choose <strong>NO </strong>if the statement contradicts the information, or choose <strong>NOT GIVEN</strong> if there is no information on this.</p>",
          question_text: "----",
          context: null,
          points: 1,
          is_active: true,
          options: [],
          sub_questions: [
            {
              question_number: 21,
              question_text:
                "Water use per person is higher in the industrial world than it was in Ancient Rome.",
              correct_answer: "NOT GIVEN",
              explanation:
                "The passage compares the water supply in ancient Rome with modern industrialized nations but does not claim water use per person is higher.",
              from_passage:
                "At the height of the Roman Empire, nine major systems...supplied the occupants of Rome with as much water per person as is provided in many parts of the industrial world today.",
              points: 1,
            },
            {
              question_number: 22,
              question_text:
                "Feeding increasing populations is possible due primarily to improved irrigation systems.",
              correct_answer: "YES",
              explanation:
                "The passage indicates that artificial irrigation systems have kept pace with population growth.",
              from_passage:
                "Food production has kept pace with soaring populations mainly because of the expansion of artificial irrigation systems that make possible the growth of 40 % of the world's food.",
              points: 1,
            },
            {
              question_number: 23,
              question_text:
                "Modern water systems imitate those of the ancient Greeks and Romans.",
              correct_answer: "NOT GIVEN",
              explanation:
                "The passage does not discuss whether modern water systems imitate those of the ancient Greeks and Romans.",
              from_passage: "",
              points: 1,
            },
            {
              question_number: 24,
              question_text:
                "Industrial growth is increasing the overall demand for water.",
              correct_answer: "NO",
              explanation:
                "The passage states demand is not rising as rapidly as predicted, and in some places has fallen.",
              from_passage:
                "Fortunately - and unexpectedly - the demand for water is not rising as rapidly as some predicted.",
              points: 1,
            },
            {
              question_number: 25,
              question_text:
                "Modern technologies have led to a reduction in domestic water consumption.",
              correct_answer: "YES",
              explanation:
                "The passage mentions that modern technologies have helped reduce water consumption in developed nations.",
              from_passage:
                "But since 1980, the amount of water consumed per person has actually decreased, thanks to a range of new technologies that help to conserve water in homes and industry.",
              points: 1,
            },
            {
              question_number: 26,
              question_text:
                "In the future, governments should maintain ownership of water infrastructures.",
              correct_answer: "NOT GIVEN",
              explanation:
                "The passage does not mention whether governments should maintain ownership of water infrastructures.",
              from_passage: "",
              points: 1,
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // PART 3 — EDUCATING PSYCHE
    // ══════════════════════════════════════════════════════════════════
    {
      part: 3,
      title: "EDUCATING PSYCHE",
      time_limit_minutes: 20,
      difficulty: "MEDIUM",
      is_active: true,
      total_questions: 14,
      content: `Educating Psyche by Bernie Neville is a book which looks at radical new approaches to learning, describing the effects of emotion, imagination and the unconscious on learning.One theory discussed in the book is that proposed by George Lozanov, which focuses on the power of suggestion.

Lozanov's instructional technique is based on the evidence that the connections made in the brain through unconscious processing (which he calls non-specific mental reactivity) are more durable than those made through conscious processing.Besides the laboratory evidence for this, we know from our experience that we often remember what we have perceived peripherally, long after we have forgotten what we set out to learn.If we think of a book we studied months or years ago, we will find it easier to recall peripheral details - the colour, the binding, the typeface, the table at the library where we sat while studying it - than the content on which we were concentrating.If we think of a lecture we listened to with great concentration, we will recall the lecturer's appearance and mannerisms, our place in the auditorium, the failure of the air-conditioning, much more easily than the ideas we went to learn.Even if these peripheral details are a bit elusive, they come back readily in hypnosis or when we relive the event imaginatively, as in psychodrama.The details of the content of the lecture, on the other hand, seem to have gone forever.

This phenomenon can be partly attributed to the common counterproductive approach to study (making extreme efforts to memorise, tensing muscles, inducing fatigue), but it also simply reflects the way the brain functions.Lozanov therefore made indirect instruction (suggestion) central to his teaching system.In suggestopedia, as he called his method, consciousness is shifted away from the curriculum to focus on something peripheral.The curriculum then becomes peripheral and is dealt with by the reserve capacity of the brain.

The suggestopedic approach to foreign language learning provides a good illustration.In its most recent variant (1980), it consists of the reading of vocabulary and text while the class is listening to music.The first session is in two parts.In the first part, the music is classical (Mozart, Beethoven, Brahms) and the teacher reads the text slowly and solemnly, with attention to the dynamics of the music.The students follow the text in their books.This is followed by several minutes of silence.In the second part, they listen to baroque music (Bach, Corelli, Handel) while the teacher reads the text in a normal speaking voice.During this time they have their books closed.During the whole of this session, their attention is passive; they listen to the music but make no attempt to learn the material.

Beforehand, the students have been carefully prepared for the language learning experience.Through meeting with the staff and satisfied students they develop the expectation that learning will be easy and pleasant and that they will successfully learn several hundred words of the foreign language during the class.In a preliminary talk, the teacher introduces them to the material to be covered, but does not 'teach' it.Likewise, the students are instructed not to try to learn it during this introduction.

Some hours after the two-part session, there is a follow-up class at which the students are stimulated to recall the material presented.Once again the approach is indirect.The students do not focus their attention on trying to remember the vocabulary, but focus on using the language to communicate (e.g. through games or improvised dramatisations).Such methods are not unusual in language teaching.What is distinctive in the suggestopedic method is that they are devoted entirely to assisting recall.The 'learning' of the material is assumed to be automatic and effortless, accomplished while listening to music.The teacher's task is to assist the students to apply what they have learned paraconsciously, and in doing so to make it easily accessible to consciousness.Another difference from conventional teaching is the evidence that students can regularly learn 1000 new words of a foreign language during a suggestopedic session, as well as grammar and idiom.

Lozanov experimented with teaching by direct suggestion during sleep, hypnosis and trance states, but found such procedures unnecessary.Hypnosis, yoga, Silva mind-control, religious ceremonies and faith healing are all associated with successful suggestion, but none of their techniques seem to be essential to it.Such rituals may be seen as placebos.Lozanov acknowledges that the ritual surrounding suggestion in his own system is also a placebo, but maintains that without such a placebo people are unable or afraid to tap the reserve capacity of their brains.Like any placebo, it must be dispensed with authority to be effective.Just as a doctor calls on the full power of autocratic suggestion by insisting that the patient take precisely this white capsule precisely three times a day before meals, Lozanov is categoric in insisting that the suggestopedic session be conducted exactly in the manner designated, by trained and accredited suggestopedic teachers.

While suggestopedia has gained some notoriety through success in the teaching of modern languages, few teachers are able to emulate the spectacular results of Lozanov and his associates.We can, perhaps, attribute mediocre results to an inadequate placebo effect.The students have not developed the appropriate mind set.They are often not motivated to learn through this method.They do not have enough 'faith'.They do not see it as 'real teaching', especially as it does not seem to involve the 'work' they have learned to believe is essential to learning.`,
      question_groups: [
        // ── Group 6: MULTIPLE_CHOICE Q27 ─────────────────────────────
        {
          question_number: 27,
          type: "MULTIPLE_CHOICE",
          instruction: "<p>Choose the correct answer. </p>",
          question_text:
            "<p>The&nbsp;book&nbsp;Educating&nbsp;Psyche&nbsp;is&nbsp;mainly&nbsp;concerned&nbsp;with</p>",
          context: null,
          points: 1,
          is_active: true,
          options: [
            {
              option_key: "A",
              option_text: "the power of suggestion in learning.",
              is_correct: false,
              order_index: 0,
            },
            {
              option_key: "B",
              option_text:
                "a particular technique for learning based on emotions.",
              is_correct: false,
              order_index: 1,
            },
            {
              option_key: "C",
              option_text:
                " the effects of emotion on the imagination and the unconscious.",
              is_correct: false,
              order_index: 2,
            },
            {
              option_key: "D",
              option_text: " ways of learning which are not traditional.",
              is_correct: true,
              order_index: 3,
              explanation:
                "The book is mainly focused on unconventional methods of learning.",
              from_passage:
                "Educating Psyche by Bernie Neville is a book which looks at radical new approaches to learning.",
            },
          ],
          sub_questions: [
            {
              question_number: 27,
              question_text: "",
              correct_answer: "D",
              explanation:
                "The book is mainly focused on unconventional methods of learning, specifically discussing the effects of emotion, imagination, and the unconscious on learning.",
              from_passage:
                "Educating Psyche by Bernie Neville is a book which looks at radical new approaches to learning, describing the effects of emotion, imagination and the unconscious on learning.",
              points: 1,
            },
          ],
        },

        // ── Group 7: MULTIPLE_CHOICE Q28 ─────────────────────────────
        {
          question_number: 28,
          type: "MULTIPLE_CHOICE",
          instruction: "<p>Choose the correct answer. </p>",
          question_text:
            "<p>Lozanov's&nbsp;theory&nbsp;claims&nbsp;that,&nbsp;when&nbsp;we&nbsp;try&nbsp;to&nbsp;remember&nbsp;things,</p>",
          context: null,
          points: 1,
          is_active: true,
          options: [
            {
              option_key: "A",
              option_text: "unimportant details are the easiest to recall.",
              is_correct: true,
              order_index: 0,
            },
            {
              option_key: "B",
              option_text: " concentrating hard produces the best results.",
              is_correct: false,
              order_index: 1,
            },
            {
              option_key: "C",
              option_text:
                " the most significant facts are most easily recalled.",
              is_correct: false,
              order_index: 2,
            },
            {
              option_key: "D",
              option_text: "peripheral vision is not important.",
              is_correct: false,
              order_index: 3,
            },
          ],
          sub_questions: [
            {
              question_number: 28,
              question_text: "",
              correct_answer: "A",
              explanation:
                "Lozanov's theory suggests that unimportant or peripheral details are often the easiest to recall.",
              from_passage:
                "If we think of a book we studied months or years ago, we will find it easier to recall peripheral details - the colour, the binding, the typeface, the table at the library where we sat while studying it - than the content on which we were concentrating.",
              points: 1,
            },
          ],
        },

        // ── Group 8: MULTIPLE_CHOICE Q29 ─────────────────────────────
        {
          question_number: 29,
          type: "MULTIPLE_CHOICE",
          instruction: "<p>Choose the correct answer. </p>",
          question_text:
            "<p>In&nbsp;this&nbsp;passage,&nbsp;the&nbsp;author&nbsp;uses&nbsp;the&nbsp;examples&nbsp;of&nbsp;a&nbsp;book&nbsp;and&nbsp;a&nbsp;lecture&nbsp;to&nbsp;illustrate&nbsp;that</p>",
          context: null,
          points: 1,
          is_active: true,
          options: [
            {
              option_key: "A",
              option_text:
                " both of these are important for developing concentration.",
              is_correct: false,
              order_index: 0,
            },
            {
              option_key: "B",
              option_text: "his theory about methods of learning is valid.",
              is_correct: true,
              order_index: 1,
            },
            {
              option_key: "C",
              option_text:
                "reading is a better technique for learning than listening.",
              is_correct: false,
              order_index: 2,
            },
            {
              option_key: "D",
              option_text: "we can remember things more easily under hypnosis.",
              is_correct: false,
              order_index: 3,
            },
          ],
          sub_questions: [
            {
              question_number: 29,
              question_text: "",
              correct_answer: "B",
              explanation:
                "The author uses these examples to demonstrate that peripheral details are remembered more than core content, supporting Lozanov's theory.",
              from_passage:
                "If we think of a lecture we listened to with great concentration, we will recall the lecturer's appearance and mannerisms, our place in the auditorium, the failure of the air-conditioning, much more easily than the ideas we went to learn.",
              points: 1,
            },
          ],
        },

        // ── Group 9: MULTIPLE_CHOICE Q30 ─────────────────────────────
        {
          question_number: 30,
          type: "MULTIPLE_CHOICE",
          instruction: "<p>Choose the correct answer. </p>",
          question_text:
            "<p>Lozanov&nbsp;claims&nbsp;that&nbsp;teachers&nbsp;should&nbsp;train&nbsp;students&nbsp;to</p>",
          context: null,
          points: 1,
          is_active: true,
          options: [
            {
              option_key: "A",
              option_text: " memorise details of the curriculum.",
              is_correct: false,
              order_index: 0,
            },
            {
              option_key: "B",
              option_text: " develop their own sets of indirect instructions. ",
              is_correct: true,
              order_index: 1,
            },
            {
              option_key: "C",
              option_text:
                "think about something other than the curriculum content.",
              is_correct: false,
              order_index: 2,
            },
            {
              option_key: "D",
              option_text: " avoid overloading the capacity of the brain.",
              is_correct: false,
              order_index: 3,
            },
          ],
          sub_questions: [
            {
              question_number: 30,
              question_text: "",
              correct_answer: "B",
              explanation:
                "Lozanov claims that teachers should direct students' attention away from the curriculum to something peripheral.",
              from_passage:
                "In suggestopedia, as he called his method, consciousness is shifted away from the curriculum to focus on something peripheral.",
              points: 1,
            },
          ],
        },

        // ── Group 10: TRUE_FALSE_NOT_GIVEN (Q31–36) ──────────────────
        {
          question_number: 31,
          type: "TRUE_FALSE_NOT_GIVEN",
          instruction:
            "<p>Choose <strong>TRUE </strong>if the statement agrees with the information given in the text, choose <strong>FALSE </strong>if the statement contradicts the information, or choose <strong>NOT GIVEN</strong> if there is no information on this.</p>",
          question_text: "----",
          context: null,
          points: 1,
          is_active: true,
          options: [],
          sub_questions: [
            {
              question_number: 31,
              question_text:
                "In the example of suggestopedic teaching in the fourth paragraph, the only variable that changes is the music.",
              correct_answer: "FALSE",
              explanation:
                "The music is not the only variable; the teacher's reading style and whether books are open also change.",
              from_passage:
                "In the first part, the music is classical (Mozart, Beethoven, Brahms) and the teacher reads the text slowly and solemnly...In the second part, they listen to baroque music (Bach, Corelli, Handel) while the teacher reads the text in a normal speaking voice.",
              points: 1,
            },
            {
              question_number: 32,
              question_text:
                "Prior to the suggestopedia class, students are made aware that the language experience will be demanding.",
              correct_answer: "FALSE",
              explanation:
                "Students are told that the learning experience will be easy and pleasant, not demanding.",
              from_passage:
                "Through meeting with the staff and satisfied students they develop the expectation that learning will be easy and pleasant.",
              points: 1,
            },
            {
              question_number: 33,
              question_text:
                "In the follow-up class, the teaching activities are similar to those used in conventional classes.",
              correct_answer: "TRUE",
              explanation:
                "The activities such as games or improvised dramatizations are not unusual in language teaching.",
              from_passage:
                "Such methods are not unusual in language teaching.",
              points: 1,
            },
            {
              question_number: 34,
              question_text:
                "As an indirect benefit, students notice improvements in their memory.",
              correct_answer: "NOT GIVEN",
              explanation:
                "The passage does not mention whether students notice improvements in their memory as a direct result of suggestopedia.",
              from_passage: "",
              points: 1,
            },
            {
              question_number: 35,
              question_text:
                "Teachers say they prefer suggestopedia to traditional approaches to language teaching.",
              correct_answer: "NOT GIVEN",
              explanation:
                "The passage does not mention the preferences of teachers.",
              from_passage: "",
              points: 1,
            },
            {
              question_number: 36,
              question_text:
                "Students in a suggestopedia class retain more new vocabulary than those in ordinary classes.",
              correct_answer: "TRUE",
              explanation:
                "The passage states students can learn significantly more vocabulary in a suggestopedic session.",
              from_passage:
                "Another difference from conventional teaching is the evidence that students can regularly learn 1000 new words of a foreign language during a suggestopedic session, as well as grammar and idiom.",
              points: 1,
            },
          ],
        },

        // ── Group 11: SUMMARY_COMPLETION_DRAG_DROP (Q37–40) ──────────
        {
          question_number: 37,
          type: "SUMMARY_COMPLETION_DRAG_DROP",
          instruction:
            "<p>Complete the summary using the list of words or phrases below.</p>",
          question_text:
            "<p>Suggestopedia uses a less direct method of suggestion than other techniques such as hypnosis. However, Lozanov admits that a certain amount of ______  is necessary in order to convince students, even if this is just a ______ there. Furthermore, if the method is to succeed, teachers must follow a set procedure. Although Lozanov's method has become quite ______ , the results of most other teachers using this method have been ______ .</p>",
          context: null,
          points: 1,
          is_active: true,
          options: [
            {
              option_key: "A",
              option_text: "spectacular",
              is_correct: false,
              order_index: 0,
            },
            {
              option_key: "B",
              option_text: "teaching",
              is_correct: false,
              order_index: 1,
            },
            {
              option_key: "C",
              option_text: "lesson",
              is_correct: false,
              order_index: 2,
            },
            {
              option_key: "D",
              option_text: "authoritarian",
              is_correct: false,
              order_index: 3,
            },
            {
              option_key: "E",
              option_text: "unpopular",
              is_correct: false,
              order_index: 4,
            },
            {
              option_key: "F",
              option_text: "ritual",
              is_correct: false,
              order_index: 5,
            },
            {
              option_key: "G",
              option_text: "unspectacular",
              is_correct: false,
              order_index: 6,
            },
            {
              option_key: "H",
              option_text: "placebo",
              is_correct: false,
              order_index: 7,
            },
            {
              option_key: "I",
              option_text: "involved",
              is_correct: false,
              order_index: 8,
            },
            {
              option_key: "J",
              option_text: "appropriate",
              is_correct: false,
              order_index: 9,
            },
            {
              option_key: "K",
              option_text: "well known",
              is_correct: false,
              order_index: 10,
            },
          ],
          sub_questions: [
            {
              question_number: 37,
              question_text: "",
              correct_answer: "ritual",
              explanation:
                "Lozanov acknowledges that a certain amount of ritual is necessary.",
              from_passage:
                "Lozanov acknowledges that the ritual surrounding suggestion in his own system is also a placebo, but maintains that without such a placebo people are unable or afraid to tap the reserve capacity of their brains.",
              points: 1,
            },
            {
              question_number: 38,
              question_text: "",
              correct_answer: "placebo",
              explanation:
                "Lozanov admits the ritual is also a placebo effect.",
              from_passage:
                "Lozanov acknowledges that the ritual surrounding suggestion in his own system is also a placebo.",
              points: 1,
            },
            {
              question_number: 39,
              question_text: "",
              correct_answer: "well known",
              explanation:
                "Suggestopedia has gained notoriety (become well known) through success in language teaching.",
              from_passage:
                "While suggestopedia has gained some notoriety through success in the teaching of modern languages.",
              points: 1,
            },
            {
              question_number: 40,
              question_text: "",
              correct_answer: "unspectacular",
              explanation:
                "Most other teachers' results have been mediocre/unspectacular.",
              from_passage:
                "We can, perhaps, attribute mediocre results to an inadequate placebo effect.",
              points: 1,
            },
          ],
        },
      ],
    },
  ],
};

// ── Runner ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("⏳ Creating Cambridge 7 Test 1...");
  try {
    const result = await adminCreateTest(payload);
    console.log(`✅ Created! Test ID: ${result.id} — "${result.global_title}"`);
    console.log(`   Parts: ${result.parts.length}`);
  } catch (err: unknown) {
    const e = err as { response?: { data?: unknown }; message?: string };
    console.error("❌ Failed:", e?.response?.data ?? e?.message);
  }
}

main();
