# Short retellings of Aesop's fables in simple words for young readers.
# Based on George Fyler Townsend's translation, "Three Hundred Aesop's Fables"
# (Project Gutenberg eBook #21, public domain in the USA). The retellings and all
# questions are original to this bank. Grim parts are softened for ages 7-10.
# Each question: (step, prompt, answer, [wrong, wrong, wrong], explanation)

FABLES = [
# ---------------- ages 7-8 (about 40-65 words) ----------------
dict(key="lion-mouse", title="The Lion and the Mouse", band="7-8", text=
"A little Mouse ran over a sleeping Lion's face. The Lion woke up and grabbed him. \"Please let me go,\" said the Mouse. \"One day I will help you.\" The Lion laughed and let him go. Later, hunters tied the Lion up with ropes. The Mouse heard him roar. He chewed the ropes with his teeth and set the Lion free.",
qs=[
 (1, "Who woke up the Lion?", "A little Mouse", ["A hunter", "A bird", "A big bear"], "The Mouse ran over the Lion's face and woke him."),
 (2, "What did the hunters use to tie up the Lion?", "Ropes", ["A box", "A net of leaves", "A chain of flowers"], "The hunters tied the Lion up with ropes."),
 (3, "How did the Mouse free the Lion?", "He chewed the ropes", ["He called for help", "He untied a knot with his paws", "He roared very loudly"], "The Mouse chewed the ropes with his teeth."),
 (4, "Why did the Lion laugh at the Mouse?", "He did not think a mouse could help him", ["The Mouse told a joke", "The Mouse was wearing a hat", "He was very sleepy"], "The Lion laughed because he did not think a tiny mouse could ever help a lion."),
 (5, "What is the lesson of this story?", "Even small friends can be a big help", ["Lions are always the strongest", "Never go to sleep", "Mice should stay away from lions"], "The tiny Mouse helped the big Lion, so even small friends can help a lot."),
]),
dict(key="fox-grapes", title="The Fox and the Grapes", band="7-8", text=
"A hungry Fox saw some ripe grapes hanging high on a vine. She jumped and jumped, but she could not reach them. At last she walked away. \"Those grapes are sour anyway,\" she said. \"I did not want them.\"",
qs=[
 (1, "What did the Fox want to eat?", "Grapes", ["Apples", "Cheese", "Fish"], "The Fox saw ripe grapes on a vine."),
 (2, "Why could the Fox not get the grapes?", "They were too high", ["They were too sour", "A bird took them", "The vine was far away in the sea"], "The grapes hung too high for the Fox to reach."),
 (3, "What did the Fox say about the grapes?", "They are sour anyway", ["They are the best grapes", "I will come back tomorrow", "Please share them with me"], "She said the grapes were sour."),
 (4, "Why did the Fox say the grapes were sour?", "To feel better about not getting them", ["She had tasted them", "A friend told her", "They were green and small"], "She never tasted them. She said it to feel better."),
 (5, "What is the lesson of this story?", "Some people pretend not to want what they cannot get", ["Grapes are always sour", "Foxes are good at jumping", "Always eat fruit"], "The Fox pretended she did not want the grapes because she could not get them."),
]),
dict(key="crow-pitcher", title="The Crow and the Pitcher", band="7-8", text=
"A thirsty Crow found a pitcher with a little water at the bottom. His beak could not reach it. The Crow had an idea. He dropped small stones into the pitcher, one by one. The water rose higher and higher. At last he could drink.",
qs=[
 (1, "Who was thirsty?", "A Crow", ["A Fox", "A Mouse", "A Dog"], "The story is about a thirsty Crow."),
 (2, "Where was the water?", "At the bottom of a pitcher", ["In a big lake", "On a leaf", "In a cup on a table"], "There was a little water at the bottom of a pitcher."),
 (3, "What did the Crow drop into the pitcher?", "Small stones", ["Leaves", "Sticks", "Seeds"], "He dropped small stones in, one by one."),
 (4, "Why did the water rise?", "The stones took up space in the pitcher", ["It started to rain", "The Crow added more water", "The pitcher got bigger"], "Each stone pushed the water up a little."),
 (5, "What is the lesson of this story?", "Thinking hard can solve a problem", ["Crows do not like water", "Never drink from a pitcher", "Stones are heavy"], "The Crow used a clever idea to get his drink."),
]),
dict(key="hare-tortoise", title="The Hare and the Tortoise", band="7-8", text=
"A Hare made fun of a slow Tortoise. \"I can beat you in a race,\" said the Tortoise. The race began. The Hare ran far ahead. Then he lay down and fell asleep. The Tortoise kept going, slow and steady. When the Hare woke up, the Tortoise had already won.",
qs=[
 (1, "Who won the race?", "The Tortoise", ["The Hare", "Nobody", "A Fox"], "The Tortoise reached the end first."),
 (2, "What did the Hare do in the middle of the race?", "He fell asleep", ["He ate lunch", "He ran home", "He helped the Tortoise"], "The Hare lay down and fell asleep."),
 (3, "How did the Tortoise move in the race?", "Slow and steady", ["Very fast", "By hopping", "By riding on the Hare"], "The Tortoise kept going, slow and steady."),
 (4, "Why did the Hare lose?", "He stopped and slept", ["He hurt his foot", "He got lost", "The Tortoise tricked him"], "The Hare was so sure he would win that he took a nap."),
 (5, "What is the lesson of this story?", "Slow and steady wins the race", ["Fast animals always win", "Never run a race", "Sleep is not important"], "Keeping on, even slowly, beat the fast Hare who stopped."),
]),
dict(key="ants-grasshopper", title="The Ants and the Grasshopper", band="7-8", text=
"All summer the Ants worked hard. They saved grain for the winter. The Grasshopper sang and played all day. When winter came, the Grasshopper was hungry. He asked the Ants for food. \"Why did you not save food in the summer?\" they asked. \"I was busy singing,\" he said.",
qs=[
 (1, "What did the Ants save for winter?", "Grain", ["Toys", "Water", "Flowers"], "The Ants saved grain."),
 (2, "What did the Grasshopper do all summer?", "He sang and played", ["He saved food", "He built a house", "He slept all day"], "The Grasshopper sang and played."),
 (3, "When was the Grasshopper hungry?", "In the winter", ["In the summer", "In the morning", "At a party"], "When winter came, he had no food."),
 (4, "Why did the Grasshopper have no food?", "He did not save any in the summer", ["The Ants took his food", "Rain washed it away", "He gave it to a friend"], "He spent the summer singing instead of saving food."),
 (5, "What is the lesson of this story?", "Get ready today for what you will need later", ["Never sing songs", "Ants are always grumpy", "Winter is fun"], "The Ants planned ahead, so they had food when it got cold."),
]),
dict(key="dog-reflection", title="The Dog and His Reflection", band="7-8", text=
"A Dog had a bone in his mouth. He crossed a bridge over a stream. He looked down and saw his reflection in the water. He thought it was another dog with a bigger bone. He barked to get it. His own bone fell into the water and was gone.",
qs=[
 (1, "What did the Dog have in his mouth?", "A bone", ["A ball", "A stick", "A shoe"], "The Dog carried a bone."),
 (2, "What did the Dog see in the water?", "His own reflection", ["A fish", "A real dog", "A boat"], "He saw his reflection but thought it was another dog."),
 (3, "What happened when the Dog barked?", "His bone fell into the water", ["The other dog ran away", "He got a bigger bone", "The bridge broke"], "When he opened his mouth to bark, his bone dropped."),
 (4, "Why did the Dog bark at the water?", "He wanted the bigger bone", ["He was scared of fish", "He wanted to swim", "He was calling a friend"], "He thought the dog in the water had a bigger bone."),
 (5, "What is the lesson of this story?", "If you are greedy, you can lose what you have", ["Dogs should not cross bridges", "Water is cold", "Always bark loudly"], "Wanting more made the Dog lose the bone he had."),
]),
dict(key="boy-nuts", title="The Boy and the Nuts", band="7-8", text=
"A Boy put his hand into a jar full of nuts. He grabbed as many as he could hold. But his full hand would not come out of the narrow jar. He began to cry. A man said, \"Take only half as many. Then your hand will come out.\"",
qs=[
 (1, "What was in the jar?", "Nuts", ["Candy", "Coins", "Marbles"], "The jar was full of nuts."),
 (2, "Why was the Boy crying?", "His hand was stuck in the jar", ["He dropped the jar", "He did not like nuts", "He lost his way home"], "His full hand would not come out of the narrow jar."),
 (3, "What did the man tell the Boy to do?", "Take only half as many", ["Break the jar", "Pull harder", "Ask his mom"], "The man said to take half as many nuts."),
 (4, "Why would taking fewer nuts help?", "A smaller fist fits out of the jar", ["The nuts would taste better", "The jar would get bigger", "The man would take the rest"], "With fewer nuts, his hand would be small enough to come out."),
 (5, "What is the lesson of this story?", "Do not try to take too much at once", ["Nuts are bad for you", "Jars are for grown-ups", "Crying fixes problems"], "Taking a little at a time works better than grabbing too much."),
]),
dict(key="wind-sun", title="The North Wind and the Sun", band="7-8", text=
"The North Wind and the Sun argued about who was stronger. \"Let us see who can get that man to take off his coat,\" said the Sun. The Wind blew hard, but the man held his coat tighter. Then the Sun shone warm and bright. The man got hot and took off his coat.",
qs=[
 (1, "Who argued in this story?", "The North Wind and the Sun", ["The Moon and the stars", "Two men", "The rain and the snow"], "The North Wind and the Sun argued."),
 (2, "What did they want the man to take off?", "His coat", ["His hat", "His shoes", "His bag"], "They wanted to see who could get his coat off."),
 (3, "What did the man do when the Wind blew?", "He held his coat tighter", ["He took off his coat", "He went to sleep", "He flew a kite"], "The harder the Wind blew, the tighter he held his coat."),
 (4, "Why did the man take off his coat?", "The Sun made him feel hot", ["The Wind blew it away", "It was wet", "He gave it to a friend"], "The warm Sun made him too hot for a coat."),
 (5, "What is the lesson of this story?", "Being gentle can work better than being rough", ["The Wind is always strong", "Always wear a coat", "Never argue with the Sun"], "The kind, warm Sun did what the hard Wind could not."),
]),
dict(key="mountain-mouse", title="The Mountain and the Mouse", band="7-8", text=
"One day a Mountain began to shake and rumble. It made loud groans and noises. People came from far away to see what big thing would happen. They waited and waited. At last, out came one tiny Mouse.",
qs=[
 (1, "What made loud noises?", "A Mountain", ["A train", "A storm cloud", "A giant"], "The Mountain began to shake and rumble."),
 (2, "What came out of the Mountain?", "A tiny Mouse", ["A big dragon", "A river", "A bear"], "Out came one tiny Mouse."),
 (3, "Why did people come from far away?", "To see what big thing would happen", ["To climb the Mountain", "To have a picnic", "To catch the Mouse"], "They thought something big was about to happen."),
 (4, "How did the people most likely feel at the end?", "Surprised", ["Angry at the Mouse", "Very sleepy", "Scared of the Mouse"], "After all that noise, they only saw a tiny Mouse."),
 (5, "What is the lesson of this story?", "Do not make a big fuss about a small thing", ["Mountains are full of mice", "Never visit mountains", "Loud noises are fun"], "All that noise was about something small."),
]),
dict(key="gnat-bull", title="The Gnat and the Bull", band="7-8", text=
"A tiny Gnat sat on a Bull's horn for a long time. When he was ready to fly away, he buzzed loudly. \"Do you want me to go now?\" he asked the Bull. The Bull said, \"I did not know you were here. I will not miss you when you go.\"",
qs=[
 (1, "Where did the Gnat sit?", "On the Bull's horn", ["On a flower", "On the Bull's tail", "On a fence"], "The Gnat sat on the Bull's horn."),
 (2, "What did the Gnat ask the Bull?", "Do you want me to go now?", ["Can I have some grass?", "Will you race me?", "Where is the farm?"], "He asked if the Bull wanted him to go."),
 (3, "What did the Bull say?", "He did not know the Gnat was there", ["Please stay with me", "Go away now", "You are very heavy"], "The Bull had not even noticed the Gnat."),
 (4, "Why did the Bull not notice the Gnat?", "The Gnat was very small", ["The Bull was asleep", "The Gnat was hiding", "It was dark"], "The Gnat was so tiny the Bull could not feel him."),
 (5, "What is the lesson of this story?", "We may seem less important to others than we think", ["Bulls do not like bugs", "Gnats are very strong", "Always say goodbye"], "The Gnat thought he mattered a lot, but the Bull never noticed him."),
]),
dict(key="fox-crane", title="The Fox and the Crane", band="7-8", text=
"A Fox asked a Crane to dinner. He served soup in a flat dish. The Crane, with her long bill, could not eat any. The Fox laughed. Then the Crane asked the Fox to dinner. She served food in a tall jar with a thin neck. Now the Fox could not eat.",
qs=[
 (1, "Who asked the Crane to dinner first?", "The Fox", ["A Mouse", "A Bear", "The Crane's mother"], "The Fox invited the Crane first."),
 (2, "What did the Fox serve the soup in?", "A flat dish", ["A tall jar", "A big pot", "A cup"], "He served soup in a flat dish."),
 (3, "Why could the Crane not eat the soup?", "Her long bill could not get the soup from the flat dish", ["She did not like soup", "The soup was too hot", "She was not hungry"], "Her long, thin bill did not work in a flat dish."),
 (4, "Why did the Crane serve food in a tall jar?", "To give the Fox a taste of his own trick", ["She had no other dishes", "Jars keep food warm", "The Fox asked for a jar"], "She did to the Fox what he had done to her."),
 (5, "What is the lesson of this story?", "Treat others the way you want to be treated", ["Always eat soup", "Foxes are good cooks", "Never go to dinner"], "The Fox played a mean trick, and the same trick came back to him."),
]),
dict(key="mice-bell", title="The Mice and the Bell", band="7-8", text=
"The Mice had a meeting. They were afraid of the Cat. A young Mouse said, \"Let us tie a bell on the Cat. Then we will hear him coming and run away.\" Everyone loved the plan. Then an old Mouse asked, \"But who will tie the bell on the Cat?\" Nobody said a word.",
qs=[
 (1, "Who were the Mice afraid of?", "The Cat", ["The Dog", "An owl", "The farmer"], "The Mice were afraid of the Cat."),
 (2, "What was the plan?", "Tie a bell on the Cat", ["Move to a new house", "Build a wall", "Make friends with the Cat"], "They wanted to put a bell on the Cat."),
 (3, "How would the bell help the Mice?", "They would hear the Cat coming", ["It would scare the Cat away", "It would wake them up", "It would make music"], "The bell would ring when the Cat moved."),
 (4, "Why did nobody speak at the end?", "No mouse wanted to go near the Cat", ["They were asleep", "They had no bell", "They were eating"], "Tying the bell meant getting close to the Cat."),
 (5, "What is the lesson of this story?", "A plan is only good if someone can really do it", ["Bells are too loud", "Cats like bells", "Old mice are grumpy"], "The idea sounded great, but nobody could carry it out."),
]),
dict(key="oak-reeds", title="The Oak and the Reeds", band="7-8", text=
"A big Oak tree stood tall and stiff by a stream. A strong wind blew it over. It fell next to some thin Reeds. \"How did you stay standing in that wind?\" asked the Oak. \"You fought the wind,\" said the Reeds. \"We bend when the wind blows, so we do not break.\"",
qs=[
 (1, "What blew the Oak over?", "A strong wind", ["A big rain", "A farmer", "An elephant"], "A strong wind blew the Oak over."),
 (2, "Where did the Oak fall?", "Next to some Reeds", ["On a house", "Into the sea", "On a hill"], "It fell next to some thin Reeds."),
 (3, "What do the Reeds do when the wind blows?", "They bend", ["They break", "They grow taller", "They hide underground"], "The Reeds bend in the wind."),
 (4, "Why did the Reeds not break?", "They bent with the wind", ["They were very thick", "The wind missed them", "They were made of stone"], "Bending let the wind pass by without breaking them."),
 (5, "What is the lesson of this story?", "Sometimes it is better to bend than to break", ["Big trees are the best", "Wind is always bad", "Reeds are stronger than rocks"], "Giving a little can keep you from breaking."),
]),
dict(key="crab-mother", title="The Crab and His Mother", band="7-8", text=
"A Mother Crab said to her son, \"Why do you walk sideways? You should walk straight ahead.\" \"Yes, Mother,\" said the young Crab. \"Please show me how. I will follow you.\" The Mother Crab tried and tried. But she could only walk sideways too.",
qs=[
 (1, "How did the young Crab walk?", "Sideways", ["Straight ahead", "Backward on two legs", "By hopping"], "The young Crab walked sideways."),
 (2, "What did the Mother Crab want her son to do?", "Walk straight ahead", ["Swim faster", "Eat his food", "Go to sleep"], "She wanted him to walk straight."),
 (3, "What did the young Crab ask his mother to do?", "Show him how", ["Carry him", "Buy him shoes", "Let him play"], "He asked her to show him how to walk straight."),
 (4, "What happened when the Mother Crab tried?", "She walked sideways too", ["She walked straight", "She fell asleep", "She swam away"], "She could only walk sideways, just like him."),
 (5, "What is the lesson of this story?", "Show others how by doing it yourself", ["Crabs are slow", "Always walk sideways", "Mothers know everything"], "It is easier to follow an example than just to be told."),
]),
dict(key="dog-manger", title="The Dog in the Manger", band="7-8", text=
"A Dog lay down in a box full of hay. The hungry Oxen came to eat the hay. The Dog growled and snapped at them. He would not let them eat. \"What a selfish Dog,\" said one Ox. \"He cannot eat hay himself, but he will not let us eat it.\"",
qs=[
 (1, "Where did the Dog lie down?", "In a box full of hay", ["On a soft bed", "Under a tree", "By the door"], "He lay in a box full of hay."),
 (2, "Who wanted to eat the hay?", "The Oxen", ["The Dog", "The farmer", "The birds"], "The hungry Oxen wanted the hay."),
 (3, "What did the Dog do when the Oxen came?", "He growled and snapped", ["He shared the hay", "He went to sleep", "He ran away"], "He growled and snapped at them."),
 (4, "Why did the Ox call the Dog selfish?", "The Dog would not share food he could not even eat", ["The Dog ate all the hay", "The Dog took his bone", "The Dog was too loud at night"], "Dogs do not eat hay, but he still kept it from the Oxen."),
 (5, "What is the lesson of this story?", "Do not keep from others what you do not need", ["Dogs love hay", "Oxen are always hungry", "Never sleep in hay"], "The Dog kept something he could not use."),
]),

# ---------------- ages 9-10 (about 70-115 words) ----------------
dict(key="boy-wolf", title="The Boy Who Cried Wolf", band="9-10", text=
"A shepherd boy watched the sheep near a village. He was bored, so he shouted, \"Wolf! Wolf!\" The villagers ran to help him, but there was no wolf. The boy laughed at them. He played the same trick again and again. Then one evening a wolf really came. \"Wolf! Wolf!\" the boy cried. \"Please help!\" But this time nobody came, because they thought he was tricking them again. The wolf chased the whole flock away into the hills.",
qs=[
 (1, "What was the boy's job?", "Watching the sheep", ["Baking bread", "Fixing roofs", "Catching fish"], "He was a shepherd boy who watched the sheep."),
 (2, "What did the boy shout?", "Wolf! Wolf!", ["Fire! Fire!", "Help, I am lost!", "Dinner time!"], "He shouted, \"Wolf! Wolf!\""),
 (3, "What happened when a wolf really came?", "Nobody came to help", ["Everyone ran to help", "The boy chased it away", "The wolf ran from the sheep"], "Nobody came because they did not believe him."),
 (4, "Why did the villagers not come the last time?", "They thought he was tricking them again", ["They were asleep", "They could not hear him", "They were afraid of wolves"], "He had fooled them so many times that they stopped believing him."),
 (5, "What is the lesson of this story?", "People may not believe a liar even when he tells the truth", ["Wolves only come at night", "Sheep should stay in the village", "Always shout loudly"], "Because he lied before, no one trusted him when it mattered."),
]),
dict(key="bundle-sticks", title="The Bundle of Sticks", band="9-10", text=
"A father had sons who argued all the time. One day he asked them to bring him a bundle of sticks tied together. He handed the bundle to each son and said, \"Break it.\" Each son tried with all his strength, but nobody could break it. Then the father untied the bundle and gave each son one stick. They broke the sticks easily. \"If you stick together and help each other,\" said the father, \"you will be strong like the bundle. If you argue, you will break as easily as one stick.\"",
qs=[
 (1, "What did the father ask his sons to bring?", "A bundle of sticks", ["A basket of apples", "A pile of stones", "A long rope"], "He asked for a bundle of sticks."),
 (2, "What was the sons' problem?", "They argued all the time", ["They were always late", "They were very hungry", "They could not read"], "The sons argued all the time."),
 (3, "What happened when the sons tried to break the bundle?", "Nobody could break it", ["It broke right away", "It caught fire", "It floated away"], "Tied together, the sticks were too strong to break."),
 (3, "What happened when each son had only one stick?", "They broke them easily", ["They could not break them", "They threw them away", "They built a fire"], "One stick alone broke easily."),
 (4, "Why did the father use sticks to teach his sons?", "To show them they are stronger together", ["He needed firewood", "He wanted them to be tired", "He liked playing games"], "The bundle showed that being together makes you strong."),
 (5, "What is the lesson of this story?", "Working together makes us strong", ["Sticks are hard to find", "Fathers like sticks", "Never argue about wood"], "Together the sticks were strong, apart they were weak."),
]),
dict(key="fox-crow", title="The Fox and the Crow", band="9-10", text=
"A Crow sat in a tree with a piece of cheese in her beak. A Fox wanted the cheese. \"What a beautiful bird you are,\" he said. \"Your feathers shine so brightly. If your voice is as lovely as your feathers, you must be the queen of all birds.\" The Crow wanted to show off her voice, so she opened her beak and gave a loud caw. Down fell the cheese. The Fox grabbed it and said, \"Your voice is fine, my friend, but you should think more carefully.\"",
qs=[
 (1, "What did the Crow have in her beak?", "A piece of cheese", ["A shiny ring", "A worm", "A twig"], "She held a piece of cheese."),
 (2, "What did the Fox want?", "The cheese", ["A new friend", "To learn to sing", "To climb the tree"], "The Fox wanted the cheese."),
 (3, "What did the Fox say to the Crow?", "That she was beautiful", ["That she was rude", "That it would rain", "That he was lost"], "He praised her feathers and called her beautiful."),
 (4, "Why did the Crow drop the cheese?", "She opened her beak to caw", ["The Fox shook the tree", "It was too heavy", "She wanted to share"], "When she opened her beak to show off her voice, the cheese fell."),
 (5, "What is the lesson of this story?", "Be careful of people who praise you to get something", ["Crows sing badly", "Cheese is the best food", "Never sit in trees"], "The Fox used nice words to trick the Crow."),
]),
dict(key="town-country-mouse", title="The Town Mouse and the Country Mouse", band="9-10", text=
"A Country Mouse invited his friend, the Town Mouse, to visit. He served simple roots and grain. \"Come to the town with me,\" said the Town Mouse. \"I have fine food.\" In the town house there was cheese, honey, and figs. But just as they began to eat, someone opened the door. The two mice ran and hid. This happened again and again. At last the Country Mouse said, \"Thank you, but I am going home. I would rather eat simple food in peace than fancy food in fear.\"",
qs=[
 (1, "What food did the Country Mouse serve?", "Simple roots and grain", ["Cheese and honey", "Cake and cookies", "Fish and rice"], "He served simple roots and grain."),
 (2, "What food was in the town house?", "Cheese, honey, and figs", ["Only roots", "Bread and water", "Grass and leaves"], "The town house had cheese, honey, and figs."),
 (3, "What happened each time the mice began to eat in town?", "Someone came in and they had to hide", ["They got too full", "The food was taken away by a bird", "The lights went out"], "People kept coming in, so the mice ran and hid."),
 (4, "Why did the Country Mouse go home?", "He did not want to eat in fear", ["He did not like cheese", "He missed his family", "The Town Mouse was rude"], "He would rather have simple food in peace."),
 (5, "What is the lesson of this story?", "A simple, calm life can be better than a fancy, worried one", ["Town food is always best", "Mice should not travel", "Never open doors"], "Peace mattered more to the Country Mouse than fancy food."),
]),
dict(key="hercules-wagon", title="Hercules and the Wagon Driver", band="9-10", text=
"A man was driving a wagon down a muddy country road. Suddenly the wheels sank deep into the mud. The man did nothing to fix it. He just stood there and shouted for the hero Hercules to come and help him. Hercules appeared and said, \"Put your shoulder to the wheel and push, and tell your oxen to pull. Do your best to help yourself first. Then ask for help.\"",
qs=[
 (1, "Where did the wagon get stuck?", "In the mud", ["In the snow", "On a bridge", "In a river"], "The wheels sank into the mud."),
 (2, "What did the man do at first?", "He shouted for Hercules", ["He pushed the wagon", "He walked home", "He fed the oxen"], "He just stood and shouted for help."),
 (3, "What did Hercules tell the man to do?", "Push the wheel and get the oxen to pull", ["Wait for the mud to dry", "Leave the wagon", "Buy a new wagon"], "Hercules told him to push and have the oxen pull."),
 (4, "Why did Hercules not just lift the wagon out?", "He wanted the man to try first", ["He was too weak", "He did not like oxen", "He was in a hurry"], "Hercules wanted the man to help himself first."),
 (5, "What is the lesson of this story?", "Try your best to help yourself before asking for help", ["Never drive a wagon", "Heroes fix everything", "Mud is dangerous"], "Help comes best to those who try."),
]),
dict(key="ant-dove", title="The Ant and the Dove", band="9-10", text=
"An Ant went to a river to drink. The water swept her away, and she could not get out. A Dove in a tree saw her. The Dove dropped a leaf into the water. The Ant climbed onto it and floated safely to shore. Soon after, a bird catcher came and set up a net to catch the Dove. The Ant saw him and bit his foot. He jumped and shouted, and the noise made the Dove fly away to safety.",
qs=[
 (1, "Why did the Ant go to the river?", "To drink", ["To swim", "To find food", "To meet the Dove"], "The Ant went to get a drink."),
 (2, "What did the Dove drop into the water?", "A leaf", ["A stone", "A rope", "A feather"], "The Dove dropped a leaf."),
 (3, "How did the Ant help the Dove?", "She bit the bird catcher's foot", ["She built a nest", "She brought food", "She sang a warning song"], "She bit the bird catcher so he shouted and the Dove flew off."),
 (4, "Why did the Ant help the Dove?", "The Dove had helped her before", ["The Ant wanted the net", "The Dove paid her", "The bird catcher was her friend"], "She was paying back the Dove's kindness."),
 (5, "What is the lesson of this story?", "One kind act can lead to another", ["Ants should not drink water", "Doves are always safe", "Leaves make good boats"], "The Dove's kindness came back to her."),
]),
dict(key="belly-members", title="The Belly and the Body Parts", band="9-10", text=
"One day the hands, feet, mouth, and eyes got angry at the Belly. \"We work all day to bring you food,\" they said, \"and you just rest.\" So they stopped working. The hands brought no food. The mouth would not chew. Soon the whole body felt weak and tired. Then the body parts understood. The Belly had a job too. When it got food, it helped every part of the body stay strong.",
qs=[
 (1, "Who were the body parts angry at?", "The Belly", ["The heart", "The nose", "The hair"], "They were angry at the Belly."),
 (2, "What did the body parts decide to do?", "Stop working", ["Work harder", "Go to sleep", "Find a new body"], "They stopped working."),
 (3, "What happened to the body?", "It felt weak and tired", ["It got stronger", "It grew taller", "Nothing changed"], "Without food, the whole body grew weak."),
 (4, "Why did the body get weak?", "The Belly got no food to share with the body", ["It was too cold", "The eyes were closed", "It ran too far"], "The Belly needs food to keep every part strong."),
 (5, "What is the lesson of this story?", "Every member of a team has an important job", ["Bellies are lazy", "Hands do all the work", "Eat lots of food"], "Each part needs the others, just like a team."),
]),
dict(key="farmer-sons", title="The Farmer's Treasure", band="9-10", text=
"An old farmer grew too tired to work in his vineyard. He wanted his sons to care for it as he had. So he told them, \"There is a great treasure hidden in our vineyard.\" The sons took shovels and dug up every bit of the land, looking for gold. They found no gold at all. But because the soil was dug so well, the grapevines grew the biggest crop of grapes they had ever had.",
qs=[
 (1, "Where did the farmer say the treasure was?", "In the vineyard", ["In the barn", "Under the house", "In the river"], "He said it was hidden in the vineyard."),
 (2, "What did the sons use to dig?", "Shovels", ["Their hands", "Spoons", "Sticks"], "The sons dug with shovels."),
 (3, "What did the sons find?", "No gold at all", ["A box of gold", "An old map", "A sleeping bear"], "They found no gold."),
 (4, "Why did the grapevines grow so well?", "The digging made the soil good for growing", ["It rained gold", "The farmer planted new vines", "The sons watered them all night"], "Digging loosened the soil, so the vines grew a big crop."),
 (5, "What was the real treasure?", "The reward from hard work", ["A chest of coins", "A new shovel", "A secret map"], "Their hard work gave them a great crop of grapes."),
]),
dict(key="travelers-tree", title="The Travelers and the Plane Tree", band="9-10", text=
"Two travelers were tired from walking in the hot summer sun. They lay down to rest in the cool shade of a big plane tree. One traveler looked up and said, \"What a useless tree this is. It gives us no fruit at all.\" The tree spoke: \"How ungrateful you are! You are resting in my shade right now, and you call me useless?\"",
qs=[
 (1, "Why did the travelers stop to rest?", "They were tired from the hot sun", ["It was raining", "They were lost", "They wanted to eat fruit"], "They were tired from walking in the hot sun."),
 (2, "Where did the travelers rest?", "In the shade of a tree", ["In a house", "By a fire", "On a boat"], "They rested in the shade of a plane tree."),
 (3, "What did one traveler say about the tree?", "That it was useless", ["That it was beautiful", "That it was too tall", "That it was his favorite"], "He called the tree useless because it had no fruit."),
 (4, "Why was the tree upset?", "It was helping them and they did not see it", ["They broke its branches", "They were too loud", "They took its fruit"], "Its shade was helping them at that very moment."),
 (5, "What is the lesson of this story?", "Be thankful for the help you get, even if it is not what you expected", ["Trees can talk", "Always carry fruit", "Do not walk in summer"], "The travelers did not notice the gift of shade."),
]),
dict(key="swollen-fox", title="The Fox Who Ate Too Much", band="9-10", text=
"A very hungry Fox found some bread and meat that shepherds had left inside a hollow tree. He squeezed into the hole and ate it all. But now his belly was so full that he could not get back out. He groaned and moaned. Another Fox came by and asked what was wrong. When he heard the story, he said, \"You will just have to stay there until you are as thin as you were when you went in.\"",
qs=[
 (1, "Where was the food?", "Inside a hollow tree", ["In a basket", "Under a rock", "On a table"], "The food was in a hollow tree."),
 (2, "Who had left the food?", "Shepherds", ["Bears", "Children", "Birds"], "Shepherds had left the bread and meat."),
 (3, "Why could the Fox not get out?", "His belly was too full", ["The hole was blocked", "He was asleep", "He was tied up"], "After eating, he was too big to fit through the hole."),
 (4, "What did the other Fox tell him?", "Wait until he was thin again", ["Dig a new hole", "Call for help", "Eat some more"], "He would have to wait until he was thin again."),
 (5, "What is the lesson of this story?", "Think before you act, or you may get stuck", ["Foxes like bread", "Trees are good houses", "Always share food"], "The Fox did not think about how he would get out."),
]),
dict(key="two-travelers-axe", title="The Travelers and the Axe", band="9-10", text=
"Two men were walking together. One of them found an axe on the path. \"Look, I have found an axe!\" he said. \"Don't say 'I,'\" said his friend. \"Say 'we have found an axe.'\" Soon they saw the axe's owner running after them. \"Oh no, we are in trouble!\" said the first man. \"No,\" said his friend. \"You said 'I' before. Now you must say 'I am in trouble.'\"",
qs=[
 (1, "What did one man find?", "An axe", ["A coin", "A map", "A hat"], "He found an axe on the path."),
 (2, "Who came running after them?", "The axe's owner", ["A dog", "A friend", "A teacher"], "The owner of the axe ran after them."),
 (3, "What did the friend want him to say when he found the axe?", "We have found an axe", ["I have found an axe", "Let us leave it", "Who lost this?"], "The friend wanted to share: \"We have found an axe.\""),
 (4, "Why did the friend say \"Now you must say 'I am in trouble'\"?", "The man would not share the find but wanted to share the trouble", ["He did not like axes", "He wanted to run away", "He was the owner"], "The man kept the good part for himself but wanted to share the bad part."),
 (5, "What is the lesson of this story?", "If you share the good things, others will share the hard things", ["Never pick up an axe", "Always walk alone", "Owners are angry"], "Friends who share good luck will share trouble too."),
]),
dict(key="peacock-crane", title="The Peacock and the Crane", band="9-10", text=
"A Peacock spread out his beautiful tail. He laughed at a gray Crane walking by. \"Look at me,\" said the Peacock. \"My feathers have all the colors of the rainbow, like a king's robe. You have no color at all.\" \"That is true,\" said the Crane. \"But I can fly high into the sky, near the stars. You can only walk on the ground.\"",
qs=[
 (1, "What color was the Crane?", "Gray", ["Rainbow colored", "Bright red", "Gold"], "The Crane was gray."),
 (2, "What did the Peacock show off?", "His colorful tail", ["His fast running", "His loud song", "His big nest"], "He spread out his beautiful tail."),
 (3, "What can the Crane do that the Peacock cannot?", "Fly high into the sky", ["Swim under water", "Change colors", "Talk to kings"], "The Crane can fly high near the stars."),
 (4, "Why did the Peacock laugh at the Crane?", "The Crane had plain gray feathers", ["The Crane told a joke", "The Crane fell down", "The Crane was very small"], "He laughed because the Crane had no bright colors."),
 (5, "What is the lesson of this story?", "Fine feathers do not make fine birds", ["Peacocks are the best birds", "Gray is a sad color", "Never look at the sky"], "Being useful matters more than looking fancy."),
]),
dict(key="rooster-jewel", title="The Rooster and the Jewel", band="9-10", text=
"A Rooster was scratching in the farmyard, looking for food for himself and his hens. Suddenly he found a shiny jewel. \"If your owner had found you, he would be very happy,\" said the Rooster. \"He would polish you and keep you safe. But you are no use to me. I would rather have one grain of corn than all the jewels in the world.\"",
qs=[
 (1, "What was the Rooster looking for?", "Food", ["A jewel", "His hens", "A place to sleep"], "He was scratching for food."),
 (2, "What did the Rooster find?", "A shiny jewel", ["A big worm", "A bag of corn", "An egg"], "He found a shiny jewel."),
 (3, "What would the Rooster rather have?", "One grain of corn", ["More jewels", "A new farmyard", "A gold crown"], "He would rather have a grain of corn."),
 (4, "Why was the jewel no use to the Rooster?", "He could not eat it", ["It was too heavy", "It was broken", "His hens took it"], "A jewel cannot feed a hungry rooster."),
 (5, "What is the lesson of this story?", "Something is only worth a lot if it is useful to you", ["Jewels are bad", "Roosters love shiny things", "Always look for treasure"], "To the Rooster, food mattered more than a jewel."),
]),
dict(key="milkmaid-pail", title="The Milkmaid and Her Pail", band="9-10", text=
"A farm girl was carrying a pail of milk on her head to sell at the market. As she walked, she dreamed. \"With the milk money, I will buy eggs. The eggs will hatch into chickens. I will sell the chickens and buy a fine new dress. Everyone will admire me, and I will toss my head proudly like this.\" She tossed her head, and down fell the pail. All the milk spilled on the ground, and so did all her plans.",
qs=[
 (1, "What was the girl carrying?", "A pail of milk", ["A basket of eggs", "A bag of corn", "A new dress"], "She carried a pail of milk on her head."),
 (2, "What did she plan to buy with the milk money first?", "Eggs", ["A dress", "A cow", "Candy"], "She planned to buy eggs first."),
 (3, "What happened when she tossed her head?", "The pail fell and the milk spilled", ["She got a new dress", "The chickens hatched", "She reached the market"], "Tossing her head made the pail fall."),
 (4, "Why did all her plans fail?", "She stopped paying attention to the milk", ["The eggs were bad", "The market was closed", "It started to rain"], "She was busy daydreaming and forgot about the pail on her head."),
 (5, "What is the lesson of this story?", "Do not count your chickens before they hatch", ["Never carry milk", "Dresses cost too much", "Markets are far away"], "She counted on things that had not happened yet."),
]),
dict(key="two-pots", title="The Two Pots", band="9-10", text=
"A river was carrying two pots along in its stream. One pot was made of clay, and the other was made of strong brass. The Brass Pot floated closer and closer. \"Please stay away from me,\" said the Clay Pot. \"If you bump me, even a little bit, I will break into pieces. I do not want to come near you at all.\"",
qs=[
 (1, "What was carrying the two pots?", "A river", ["A boat", "A wagon", "A bird"], "A river carried them in its stream."),
 (2, "What was the strong pot made of?", "Brass", ["Clay", "Glass", "Paper"], "One pot was strong brass."),
 (3, "What did the Clay Pot ask the Brass Pot?", "To stay away", ["To come closer", "To race", "To carry it"], "The Clay Pot asked the Brass Pot to stay away."),
 (4, "Why was the Clay Pot worried?", "It would break if the Brass Pot bumped it", ["It could not swim", "It was lost", "It was too hot"], "Clay is weak and could crack against the brass."),
 (5, "What is the lesson of this story?", "Friends who are very different in strength may not be safe together", ["Brass pots are mean", "Rivers are dangerous", "Clay pots are best"], "The weak pot could be hurt even by a friendly bump."),
]),
dict(key="mole-mother", title="The Little Mole", band="9-10", text=
"A little Mole could not see, as moles cannot. But one day he said to his mother, \"I am sure I can see!\" His mother wanted to show him the truth. She put a few sweet-smelling grains of incense in front of him. \"What is this?\" she asked. \"It is a pebble,\" said the little Mole. His mother smiled. \"My son, you cannot see, and it seems you cannot smell very well either.\"",
qs=[
 (1, "Who was the story about?", "A little Mole", ["A little Mouse", "A big Owl", "A small Fox"], "The story is about a little Mole."),
 (2, "What did the little Mole say he could do?", "See", ["Fly", "Swim", "Sing"], "He said he was sure he could see."),
 (3, "What did the Mole call the incense grains?", "A pebble", ["A flower", "A seed", "A nut"], "He said, \"It is a pebble.\""),
 (4, "Why did his mother put the grains in front of him?", "To show him he could not really see", ["To give him a snack", "To plant a garden", "To play a game"], "She wanted to show him the truth."),
 (5, "What is the lesson of this story?", "Boasting about what you cannot do shows the truth about you", ["Moles like pebbles", "Mothers are tricky", "Incense smells bad"], "His boast only showed what he could not do."),
]),
]
