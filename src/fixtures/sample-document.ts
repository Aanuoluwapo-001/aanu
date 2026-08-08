/**
 * A fully hand-written sample of what the AI pipeline produces, so the
 * Reteach UI can be built and demoed without needing a live Anthropic key.
 * Subject: a short excerpt on Newton's Laws of Motion.
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Subtopic {
  id: string;
  title: string;
  sourceExcerpt: string;
  originalPoints: string[];
  plainExplanation: string;
  examples: string[];
  nuances: string[];
  quiz: QuizQuestion[];
}

export interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

export const sampleDocument: { title: string; topics: Topic[] } = {
  title: "Newton's Laws of Motion — Physics Chapter 3",
  topics: [
    {
      id: "t1",
      title: "Newton's First Law",
      subtopics: [
        {
          id: "t1-s1",
          title: "Inertia",
          sourceExcerpt:
            "p.42 — \"An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted on by a net external force.\"",
          originalPoints: [
            "Objects resist changes to their state of motion.",
            "This resistance is called inertia.",
            "A net external force is required to change an object's velocity.",
          ],
          plainExplanation:
            "Think of inertia as an object's stubbornness. A still object 'wants' to stay still, and a moving object 'wants' to keep moving in a straight line at the same speed — forever — unless something pushes or pulls on it to change that.",
          examples: [
            "A book on a table stays put until you push it.",
            "Passengers in a braking car lurch forward — their bodies want to keep moving even though the car stopped.",
            "A hockey puck sliding on ice keeps going nearly forever because there's so little friction to stop it.",
          ],
          nuances: [
            "\"At rest\" and \"in motion\" are both just the object continuing its current state — the law doesn't treat stillness as special, only unforced change.",
          ],
          quiz: [
            {
              question: "What does 'inertia' refer to?",
              options: [
                "An object's resistance to a change in its motion",
                "The speed of an object",
                "The force of gravity on an object",
                "The friction between two surfaces",
              ],
              correctIndex: 0,
              explanation:
                "Inertia is specifically about resisting a *change* in motion — not speed or gravity directly.",
            },
            {
              question: "A passenger lurches forward when a car suddenly brakes. Why?",
              options: [
                "The car pushes them forward",
                "Their body was still moving forward and resists stopping",
                "Gravity pulls them forward",
                "The seatbelt causes it",
              ],
              correctIndex: 1,
              explanation:
                "The passenger's body was already in motion; inertia makes it resist the sudden change (the car stopping).",
            },
            {
              question: "According to the First Law, what is needed to change an object's velocity?",
              options: ["Time", "A net external force", "Mass", "Friction only"],
              correctIndex: 1,
              explanation: "Velocity only changes when a net (unbalanced) external force acts on the object.",
            },
            {
              question: "Which best restates the First Law?",
              options: [
                "Objects always slow down eventually",
                "Objects in motion stay in motion unless a force acts on them",
                "Force equals mass times acceleration",
                "Every action has an equal and opposite reaction",
              ],
              correctIndex: 1,
              explanation:
                "That's the First Law. The other options describe the Second and Third Laws, not the First.",
            },
          ],
        },
      ],
    },
    {
      id: "t2",
      title: "Newton's Second Law",
      subtopics: [
        {
          id: "t2-s1",
          title: "Force, Mass, and Acceleration",
          sourceExcerpt: "p.44 — \"F = ma. The acceleration of an object is directly proportional to the net force acting on it, and inversely proportional to its mass.\"",
          originalPoints: [
            "Force equals mass multiplied by acceleration (F = ma).",
            "More force on the same mass produces more acceleration.",
            "The same force on a larger mass produces less acceleration.",
          ],
          plainExplanation:
            "This law is about how hard something is to speed up or slow down. Push equally hard on a shopping cart and a car — the cart speeds up a lot, the car barely moves — because the car has way more mass. The formula F = ma just says: force needed = how heavy it is × how fast you want it to speed up.",
          examples: [
            "Pushing an empty shopping cart is easy to accelerate; a full one takes more force for the same speed-up.",
            "A golf ball flies far with a light tap because it has very little mass.",
            "Rocket engines need enormous force because rockets have enormous mass, especially fully fueled.",
          ],
          nuances: [
            "It's *net* force — if two people push a box with equal force from opposite sides, the forces cancel and there's no acceleration at all.",
          ],
          quiz: [
            {
              question: "What does the formula F = ma represent?",
              options: [
                "Force equals mass divided by acceleration",
                "Force equals mass times acceleration",
                "Force equals mass plus acceleration",
                "Mass equals force times acceleration",
              ],
              correctIndex: 1,
              explanation: "F = ma: multiply mass and acceleration to get force.",
            },
            {
              question: "If the same force is applied to a heavier object, what happens to its acceleration compared to a lighter object?",
              options: [
                "It stays the same",
                "It increases",
                "It decreases",
                "It becomes negative",
              ],
              correctIndex: 2,
              explanation: "Acceleration is inversely proportional to mass — heavier objects accelerate less for the same force.",
            },
            {
              question: "Two people push a box with equal force from opposite sides. What happens?",
              options: [
                "The box accelerates quickly",
                "The box accelerates slowly",
                "The box doesn't accelerate — the forces cancel",
                "The box moves toward the stronger person",
              ],
              correctIndex: 2,
              explanation: "Equal and opposite forces sum to zero net force, so there's no acceleration — this is the nuance about *net* force.",
            },
            {
              question: "Why does a golf ball fly far from a light tap?",
              options: [
                "It has very little mass, so little force produces a lot of acceleration",
                "Golf balls are magnetic",
                "The club applies almost no force",
                "Air resistance speeds it up",
              ],
              correctIndex: 0,
              explanation: "Low mass means even a small force produces large acceleration, per F = ma.",
            },
          ],
        },
      ],
    },
  ],
};
