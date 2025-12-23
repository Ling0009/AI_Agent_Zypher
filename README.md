# Market Intelligence Agent

A task-driven AI agent for commercial market analysis.

This agent transforms minimal, ambiguous inputs (e.g. a product name or market keyword) into structured, decision-ready market insights, without conversational back-and-forth or clarification loops.

---

## What this agent does

Given a short market query, the agent produces a structured analysis that may include:

- Market definition and scope  
- Product positioning and segmentation  
- Customer personas and jobs-to-be-done  
- Competitive landscape and substitutes  
- Pricing signals and unit economics  
- Demand drivers and structural headwinds  
- Growth opportunities and strategic risks  
- Actionable recommendations for decision-makers  

Typical use cases include:
- Evaluating a product or category opportunity  
- Understanding competitive positioning  
- Assessing monetization and profitability trends  
- Rapid market framing for early-stage product decisions  

---

## What this agent explicitly does **not** do

- Ask follow-up or clarification questions  
- Behave like a chat assistant  
- Explain its reasoning process or internal prompts  
- Generate files, reports, or external artifacts  
- Depend on user-provided structure or detailed context  

Ambiguous inputs are handled via explicit assumptions stated in the output.

---

## Design philosophy

This project is built as a **task-driven agent**, not a chat workflow.

Key design choices:
- **Task-first execution**: Each request is treated as a standalone analytical task  
- **Strong behavioral constraints**: Output is strictly analytical, not conversational  
- **Separation of concerns**:
  - Prompt governs reasoning and behavior
  - Server layer governs output contract and presentation
- **Deterministic output shape** suitable for downstream consumption (UI, evaluation, or automation)

---

## Architecture overview

- **Agent layer**:  
  Enforces analytical behavior and market-intelligence persona

- **Task construction**:  
  System instructions are injected directly into the task boundary

- **Execution**:  
  Runs on a single agent (no workflow, no planning, no tools)

- **Output sanitation**:  
  Internal governance instructions are stripped server-side before returning results

---

## Example inputs

