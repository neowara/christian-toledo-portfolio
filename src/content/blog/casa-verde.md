---
title: 'Running a home lab like it is someone else''s job'
description: 'Why some stacks in my home lab are Ansible and some are GitOps, what 80 written ADRs have actually caught, and two real incidents from a self-hosted voice assistant.'
pubDate: 'Sep 03 2026'
heroImage: '/blog/casa-verde-map.svg'
---

**casa-verde** is my home lab: a single Proxmox box running about ten LXC containers, media automation, a photo and music library, local DNS, a self-hosted voice assistant, a modded game server, plus a Home Assistant Green device tied into the same deploy pipeline. None of that is unusual for a homelab. What I think is actually worth writing about is how it's *operated*: as code, with a decision log, the same way I'd want a production system at work to be run.

<figure>
  <img src="/blog/casa-verde-map.svg" alt="casa-verde infrastructure map: Proxmox host, LXC containers, and how they connect" />
  <figcaption>The actual map of the lab, kept as an editable diagram in the repo, regenerated automatically on every change</figcaption>
</figure>

## One repo, and a real deploy pipeline

Pushing to `main` is the deploy. A self-hosted GitHub Actions runner on the host applies the relevant Ansible roles to whichever containers a push actually touches. That "actually touches" part mattered once the lab grew past a couple of containers: a full deploy used to run five playbooks fully sequentially, on the order of 5 to 6 minutes, regardless of whether a change was infra-wide or a one-line docs fix. Now a push is diffed against the previous commit: playbooks a push doesn't touch are skipped entirely (a docs-only commit deploys in about 7 seconds), and whatever's left runs concurrently as backgrounded processes within the same job, since there's only one runner to actually place work on. A full-touching push now takes roughly as long as the slowest single playbook instead of the sum of all of them.

A handful of stacks are deliberately **not** Ansible. Where a stack benefits from webhook-speed redeploys, a docker-compose service that changes often, it's managed through **Komodo**, a GitOps tool, instead: push, webhook fires, Komodo pulls and rebuilds. Everything else that stack owns (a watcher script, shared roles) still goes through Ansible. The point isn't "pick one tool," it's using whichever deploy model actually fits how often a given piece changes.

## The habit that matters more than any tool choice: writing an ADR

Every non-trivial decision in this repo gets a short written record, more than 80 of them at this point, explaining what was decided and why. That includes the decisions that turned out wrong. A same-day migration of every voice command to a different registration system once caused a universal latency regression across the board, not just the commands being migrated; the record of that mistake, and the partial revert that fixed it, is right there next to the change that caused it. That's the actual value of the habit: it's not a changelog of successes, it's a record of reasoning good enough that a bad call gets caught and explained instead of quietly forgotten.

A concrete example: the self-hosted voice assistant runs Whisper for speech-to-text and a small locally fine-tuned model (not a generic chat model) for command fallback, on CPU only, no GPU. Early on, an unmatched voice command failed instantly with "sorry, I didn't understand that": safe, but not helpful. Routing unmatched commands to a local LLM instead seemed like a straightforward improvement, except the first version of that took 45 to 57 seconds to respond, because a large general chat model was being asked to read a multi-thousand-token prompt (every exposed smart-home entity gets written into it) and then generate freely. The fix wasn't more hardware, it was recognizing the model was wrong for the job: swapping to a small model actually fine-tuned for device control cut that to roughly 5 to 6 seconds, and trimming (then carefully re-expanding) how many entities get exposed at all kept the prompt size from ballooning again.

## A second, quieter bug: threads fighting over cores

Related, and less obvious: the local LLM runtime detects its thread count from the *host's* CPU topology, not the container's actual CPU limit. With no override, it spawned twelve-plus threads competing for a six-core budget, every core pegged at 100% from scheduling contention alone, generation throughput cratering to a small fraction of what the hardware could do. There's no environment variable for this; the only place to actually pin it is a model-specific parameter file, applied automatically on every deploy so it can't silently drift back to the wrong default. It's the kind of bug that looks like "the model is just slow" until you actually check what the CPU is doing.

## Monitoring means "did it actually fail," not "is it still running"

A process staying up tells you almost nothing about whether it's doing its job, that's true whether the process is a deploy pipeline or a smart-home add-on. casa-verde runs a daily drift check comparing live state against what's in git and alerts if they've diverged, container/service health checks every five minutes, SMART disk health checks, and a standing watchdog that restarts any add-on that's crashed silently, added specifically after a supervisor add-on crashed for hours with every entity it provided still showing stale cached state, so nothing *looked* wrong until something actually tried to use it. Alerts go out over a self-hosted push notification server, tiered by real severity rather than one firehose channel.

## Why bother, for a homelab

Because the failure modes of "it's just a hobby, it'll be fine" are the same failure modes that hit real production systems, just with lower stakes: drift between what's deployed and what's documented, a monitoring setup that confirms the wrong thing, a fix applied without writing down why. Running casa-verde this way is deliberate practice at catching those before they cost something that matters.
