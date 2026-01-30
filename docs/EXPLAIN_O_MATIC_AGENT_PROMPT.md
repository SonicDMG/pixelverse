# Explain-O-Matic Agent Instructions

## Overview
The Explain-O-Matic component provides 2-level educational explanations for any topic. When users ask for explanations, you MUST return this component with content for BOTH knowledge levels so users can switch between them.

## When to Use
Use the `explain-o-matic` component when users:
- Ask "Explain [topic]"
- Ask "What is [concept]?"
- Request educational information about a topic
- Want to understand complex concepts
- Ask "How does [thing] work?"

## Agent System Prompt

```
EXPLAIN-O-MATIC MODE:

When a user asks for an explanation of a topic, you MUST:
1. Generate explanations for BOTH knowledge levels (kid and layperson)
2. Return the explain-o-matic component with the "levels" prop containing both levels
3. The component will automatically show the user's preferred level and allow them to switch

IMPORTANT: You must generate content for BOTH levels in a single response. Do not generate just one level.

CONTENT GENERATION GUIDELINES:

Kid Mode (kid):
- Vocabulary: Simple, everyday words (500-1000 common words)
- Sentence length: 5-10 words
- Concepts: Concrete, observable, tangible things
- Analogies: Toys, food, animals, family, playground
- Tone: Fun, playful, encouraging, wonder-filled
- Use lots of analogies and comparisons to familiar things
- Example: "A black hole is like a super strong space vacuum cleaner that sucks up everything - even light can't escape!"

Layperson (layperson):
- Vocabulary: Standard adult vocabulary with scientific terms explained
- Sentence length: 15-25 words
- Concepts: Scientific concepts explained clearly without jargon
- Analogies: Real-world examples, technology, nature
- Tone: Educational, clear, informative but accessible
- Include proper scientific terminology but explain it
- Example: "Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon. They form when massive stars collapse at the end of their lives."

REQUIRED RESPONSE STRUCTURE:
{
  "text": "Brief 1-2 sentence summary of what you're explaining",
  "components": [
    {
      "type": "explain-o-matic",
      "props": {
        "topic": "Topic Name",
        "levels": {
          "kid": {
            "explanation": "Fun, simple explanation for kids...",
            "relatedTopics": [...],
            "citations": [...],
            "followUpQuestions": [...]
          },
          "layperson": {
            "explanation": "Clear, detailed explanation for adults...",
            "relatedTopics": [...],
            "citations": [...],
            "followUpQuestions": [...]
          }
        }
      }
    }
  ]
}

CRITICAL: You MUST include BOTH levels (kid and layperson) in the "levels" object.

CONTENT REQUIREMENTS:
1. Explanation: 2-4 paragraphs, level-appropriate
2. Related Topics: 2-4 topics for further exploration
3. Citations: 2-4 reputable sources (Wikipedia, NASA, .edu, research papers)
4. Follow-up Questions: 3-5 questions to deepen understanding

CITATION SOURCES:
- Wikipedia (standard Wikipedia for layperson, Simple English Wikipedia for kid level)
- Use Wikipedia articles as the primary and preferred source for all citations

INTERACTION FEATURES:
- Users can click related topics to ask about them
- Users can click follow-up questions to ask them
- Users can change knowledge level and see the same topic at different levels
- Knowledge level persists across sessions via localStorage
```

## Example Prompts and Responses

### Example 1: Black Holes (All 5 Levels)

**User:** "Explain black holes"

**Agent Response:**
```json
{
  "text": "Let me explain black holes at both kid and layperson levels.",
  "components": [
    {
      "type": "explain-o-matic",
      "props": {
        "topic": "Black Holes",
        "levels": {
          "kid": {
            "explanation": "A black hole is like a super strong space vacuum cleaner! It's so strong that it sucks up everything around it - even light can't escape!\n\nImagine if you had a vacuum cleaner so powerful that it could suck up your toys, your house, and even the sun! That's kind of what a black hole does in space. Once something gets too close, it gets pulled in and can never come back out.\n\nBlack holes are invisible because they eat all the light. But scientists can see them by watching how they pull on stars and gas around them. It's like seeing wind by watching leaves blow around!",
            "relatedTopics": [
              {
                "title": "Stars",
                "description": "Big balls of fire in space"
              },
              {
                "title": "Gravity",
                "description": "The force that pulls things down"
              },
              {
                "title": "Space",
                "description": "The big dark place with stars"
              }
            ],
            "citations": [
              {
                "source": "Wikipedia - Black Hole (Simple English)",
                "url": "https://simple.wikipedia.org/wiki/Black_hole",
                "excerpt": "A black hole is a place in space where gravity pulls so much that even light cannot get out."
              }
            ],
            "followUpQuestions": [
              "What happens if you fall into a black hole?",
              "Are black holes scary?",
              "Can we see black holes?",
              "Where do black holes come from?"
            ]
          },
          "layperson": {
            "explanation": "Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon. They form when massive stars (typically more than 25 times the mass of our Sun) undergo gravitational collapse at the end of their lives, compressing their mass into an infinitely small point called a singularity.\n\nThe event horizon marks the boundary beyond which escape is impossible. For a non-rotating black hole, this radius is given by the Schwarzschild radius. Rotating black holes have more complex geometries with inner and outer event horizons.\n\nBlack holes are classified by mass: stellar-mass (3-100 solar masses), intermediate-mass (100-100,000 solar masses), and supermassive (millions to billions of solar masses). Supermassive black holes exist at the centers of most galaxies. Despite being invisible, black holes can be detected through their gravitational effects on nearby matter, X-ray emissions from accretion disks, and gravitational waves from mergers.",
            "relatedTopics": [
              {
                "title": "Event Horizon",
                "description": "The point of no return around a black hole"
              },
              {
                "title": "Gravity",
                "description": "The force that attracts objects with mass"
              },
              {
                "title": "Stellar Evolution",
                "description": "How stars are born, live, and die"
              },
              {
                "title": "Galaxies",
                "description": "Massive collections of stars, gas, and dust"
              }
            ],
            "citations": [
              {
                "source": "NASA - Black Holes Explained",
                "url": "https://www.nasa.gov/audience/forstudents/k-4/stories/nasa-knows/what-is-a-black-hole-k4.html",
                "excerpt": "A black hole is a place in space where gravity pulls so much that even light cannot get out."
              },
              {
                "source": "Event Horizon Telescope Collaboration (2019)",
                "url": "https://iopscience.iop.org/article/10.3847/2041-8213/ab0ec7",
                "excerpt": "First direct image of a black hole and its vicinity."
              }
            ],
            "followUpQuestions": [
              "What happens if you fall into a black hole?",
              "How do scientists detect black holes if they're invisible?",
              "Can black holes die or disappear?",
              "What is the closest black hole to Earth?"
            ]
          },
          "undergrad": {
            "explanation": "Black holes are regions of spacetime where gravitational collapse has created a singularity surrounded by an event horizon from which nothing can escape. They form when massive stars (>25 solar masses) undergo core collapse at the end of their main sequence lifetime, or through direct collapse of dense stellar clusters.\n\nThe Schwarzschild radius r_s = 2GM/c² defines the event horizon for a non-rotating black hole, where the escape velocity equals the speed of light. For rotating black holes, the Kerr metric describes a more complex geometry with an ergosphere and inner/outer event horizons.\n\nBlack holes are classified by mass: stellar-mass (3-100 M☉), intermediate-mass (100-10⁵ M☉), and supermassive (10⁶-10¹⁰ M☉). Accretion of matter onto black holes releases enormous energy through friction in the accretion disk, powering quasars and active galactic nuclei. Gravitational wave observations from LIGO/Virgo have confirmed black hole mergers and provided direct evidence for their existence.",
            "relatedTopics": [
              {
                "title": "Schwarzschild Metric",
                "description": "Spacetime geometry around non-rotating black holes"
              },
              {
                "title": "Kerr Black Holes",
                "description": "Rotating black hole solutions"
              },
              {
                "title": "Accretion Disks",
                "description": "Matter spiraling into black holes"
              },
              {
                "title": "Gravitational Waves",
                "description": "Ripples in spacetime from black hole mergers"
              }
            ],
            "citations": [
              {
                "source": "Schwarzschild, K. (1916) - On the Gravitational Field of a Mass Point",
                "excerpt": "First exact solution to Einstein's field equations describing black hole geometry."
              },
              {
                "source": "Abbott et al. (2016) - Observation of Gravitational Waves",
                "url": "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.116.061102",
                "excerpt": "First direct detection of gravitational waves from merging black holes."
              },
              {
                "source": "Event Horizon Telescope Collaboration (2019)",
                "url": "https://iopscience.iop.org/article/10.3847/2041-8213/ab0ec7",
                "excerpt": "First direct image of a black hole shadow in M87."
              }
            ],
            "followUpQuestions": [
              "How does frame dragging work in the ergosphere?",
              "What is the no-hair theorem?",
              "How do we calculate black hole thermodynamics?",
              "What causes jets from active galactic nuclei?"
            ]
          },
          "graduate": {
            "explanation": "Black holes represent exact solutions to Einstein's field equations where spacetime curvature becomes pathological at the singularity. The Kerr-Newman metric describes the most general stationary black hole with mass M, angular momentum J, and charge Q, though astrophysical black holes are expected to be electrically neutral.\n\nThe event horizon topology is constrained by Hawking's area theorem and the cosmic censorship conjecture. Penrose diagrams reveal the causal structure, including the formation of Cauchy horizons in rotating black holes and the theoretical possibility of traversable wormholes under exotic matter conditions.\n\nHawking radiation emerges from quantum field theory in curved spacetime, with temperature T_H = ℏc³/(8πGMk_B), leading to black hole evaporation on timescales of ~10⁶⁷(M/M☉)³ years. This raises the information paradox: whether quantum information is preserved during evaporation. Recent work on soft hair, edge modes, and holographic entanglement entropy suggests resolution through quantum gravity effects.\n\nNumerical relativity simulations of binary black hole mergers have enabled precision tests of general relativity through gravitational wave observations, constraining alternative theories and measuring the ringdown quasi-normal modes.",
            "relatedTopics": [
              {
                "title": "Hawking Radiation",
                "description": "Quantum evaporation of black holes"
              },
              {
                "title": "Black Hole Information Paradox",
                "description": "Unitarity vs. no-hair theorem conflict"
              },
              {
                "title": "Numerical Relativity",
                "description": "Computational solutions to Einstein equations"
              },
              {
                "title": "Quasi-Normal Modes",
                "description": "Ringdown oscillations of perturbed black holes"
              }
            ],
            "citations": [
              {
                "source": "Hawking, S. (1974) - Black Hole Explosions?",
                "url": "https://www.nature.com/articles/248030a0",
                "excerpt": "Black holes emit thermal radiation due to quantum effects near the event horizon."
              },
              {
                "source": "Pretorius, F. (2005) - Evolution of Binary Black Hole Spacetimes",
                "url": "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.95.121101",
                "excerpt": "First successful numerical simulation of binary black hole merger."
              },
              {
                "source": "Almheiri et al. (2013) - Black Holes: Complementarity or Firewalls?",
                "url": "https://link.springer.com/article/10.1007/JHEP02(2013)062",
                "excerpt": "AMPS paradox challenging black hole complementarity."
              }
            ],
            "followUpQuestions": [
              "How does the membrane paradigm relate to black hole thermodynamics?",
              "What is the role of soft hair in resolving the information paradox?",
              "How do we extract energy from rotating black holes via the Penrose process?",
              "What constraints do gravitational wave observations place on alternative theories?"
            ]
          },
          "expert": {
            "explanation": "Black hole physics sits at the intersection of general relativity, quantum field theory, and thermodynamics, with profound implications for quantum gravity. The Bekenstein-Hawking entropy S = A/(4ℓ_P²) suggests black holes are maximum entropy objects, with the holographic principle implying that bulk physics is encoded on the boundary.\n\nThe AdS/CFT correspondence provides a concrete realization where black holes in Anti-de Sitter space correspond to thermal states in the boundary CFT, with Hawking-Page transitions describing confinement/deconfinement phase transitions. Holographic entanglement entropy via the Ryu-Takayanagi formula S_A = Area(γ_A)/(4G_N) connects spacetime geometry to quantum information.\n\nRecent developments include: (1) soft hair and asymptotic symmetries (BMS group) as potential information carriers, (2) island formula modifications to the Page curve resolving the information paradox in semiclassical gravity, (3) complexity=action and complexity=volume conjectures relating computational complexity to black hole interiors, (4) quantum extremal surfaces and the quantum focusing conjecture.\n\nGravitational wave astronomy has enabled precision tests: measuring black hole spins through inspiral-merger-ringdown consistency, constraining the graviton mass to <10⁻²³ eV, testing the no-hair theorem via quasi-normal mode spectroscopy, and searching for echoes that might signal quantum structure at the horizon scale. Future space-based detectors (LISA) will probe supermassive black hole mergers and extreme mass ratio inspirals.",
            "relatedTopics": [
              {
                "title": "AdS/CFT Correspondence",
                "description": "Holographic duality between gravity and quantum field theory"
              },
              {
                "title": "Island Formula",
                "description": "Quantum extremal surfaces and Page curve resolution"
              },
              {
                "title": "BMS Symmetries",
                "description": "Asymptotic symmetries and soft hair"
              },
              {
                "title": "Quantum Complexity",
                "description": "Complexity=action/volume conjectures"
              },
              {
                "title": "Gravitational Wave Astronomy",
                "description": "Testing strong-field gravity with LIGO/Virgo/LISA"
              }
            ],
            "citations": [
              {
                "source": "Maldacena, J. (1998) - The Large N Limit of Superconformal Field Theories",
                "url": "https://link.springer.com/article/10.1023/A:1026654312961",
                "excerpt": "Original AdS/CFT correspondence paper establishing holographic duality."
              },
              {
                "source": "Almheiri et al. (2020) - The Entropy of Hawking Radiation",
                "url": "https://link.springer.com/article/10.1007/JHEP05(2020)013",
                "excerpt": "Island formula resolving information paradox in semiclassical gravity."
              },
              {
                "source": "Strominger, A. (2017) - Lectures on the Infrared Structure of Gravity",
                "url": "https://arxiv.org/abs/1703.05448",
                "excerpt": "BMS symmetries, soft theorems, and memory effects in quantum gravity."
              },
              {
                "source": "Abbott et al. (2021) - Tests of General Relativity with GWTC-3",
                "url": "https://arxiv.org/abs/2112.06861",
                "excerpt": "Comprehensive tests of GR using gravitational wave observations."
              }
            ],
            "followUpQuestions": [
              "How does the island formula modify the Page curve in realistic black hole geometries?",
              "What is the relationship between BMS charges and soft hair in resolving the information paradox?",
              "Can we observationally distinguish between classical horizons and quantum fuzzballs?",
              "How do complexity growth rates relate to black hole interior dynamics and the firewall paradox?",
              "What constraints can multi-messenger astronomy place on Planck-scale modifications to black hole structure?"
            ]
          }
        }
      }
    }
  ]
}
```

## Testing

Test the component at: `/test-explain-o-matic`

The test page includes:
- Sample explanations for multiple topics
- All 5 knowledge levels with different content
- Related topics that populate the query bar when clicked
- Follow-up questions that populate the query bar when clicked
- Citations with and without URLs
- localStorage persistence testing

## Integration Checklist

- [ ] Agent configured to detect "explain" requests
- [ ] Agent generates BOTH kid and layperson level content
- [ ] Agent includes 2-4 related topics for each level
- [ ] Agent includes 2-4 citations with sources for each level
- [ ] Agent includes 3-5 follow-up questions for each level
- [ ] Response follows exact JSON structure with "levels" prop
- [ ] Test with both knowledge levels
- [ ] Verify localStorage persistence works
- [ ] Verify related topics populate query bar
- [ ] Verify follow-up questions populate query bar

## Made with Bob