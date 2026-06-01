---
name: code-review-levels
description: Reference documents for deep code review (Level 3) and architecture review (Level 4). Used by code-reviewer agent for advanced review levels.
allowed-tools: Read
---

# Code Review Levels Reference

`code-reviewer` 에이전트가 Level 3/4 리뷰 시 참조하는 상세 가이드입니다.

## Available References

| Level | File | 용도 |
|-------|------|------|
| Level 3 (Deep) | [deep-review.md](deep-review.md) | 호출 체인, 에지 케이스, 동시성, 보안 심층 분석 |
| Level 4 (Architecture) | [architecture-review.md](architecture-review.md) | SOLID 원칙, 의존성 분석, 계층 위반 탐지, 확장성 |

## Usage

`code-reviewer` 에이전트가 Level 3 또는 4 리뷰를 수행할 때 해당 파일을 Read하여 프로토콜을 따릅니다.
