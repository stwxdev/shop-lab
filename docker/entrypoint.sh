#!/bin/bash
bun install
bunx prisma generate
bunx prisma migrate dev --name init --skip-seed
bun dev