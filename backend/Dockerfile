FROM python:3.11-slim

WORKDIR /app


COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV DATABASE_URL=postgresql://neondb_owner:npg_X8fbetnGi4RL@ep-crimson-mud-aiti8jj2-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
ENV BETTER_AUTH_SECRET=U1F7wyT+KtRK5pnlRkYOo2SK4wK6mlIpZAXEbGWXH9I=
ENV JWT_SECRET=049ad9625d29e8e661edf680f9543e0d49fa14f155625f2264d998bf2a6eb4a8
ENV JWT_ALGORITHM=HS256
ENV JWT_EXPIRATION_HOURS=24
ENV CORS_ORIGINS=http://localhost:3000
ENV DEBUG=True
ENV HOST=0.0.0.0
ENV PORT=8000
ENV GEMINI_API_KEY=AIzaSyAAWKpmmuF42G3vluzyQTFeiahwfgMf08c

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl build-essential ca-certificates gcc libssl-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

# install Rust toolchain (provides cargo and /root/.cargo/bin)
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# install uv (astral's uv manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# copy dependency files
COPY pyproject.toml uv.lock ./

# install dependencies using uv (uv will create a .venv with packages, including uvicorn)
RUN uv sync 

# copy app sources
COPY . .

EXPOSE 8000
# run uvicorn from the created venv to ensure correct environment
CMD [".venv/bin/uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
