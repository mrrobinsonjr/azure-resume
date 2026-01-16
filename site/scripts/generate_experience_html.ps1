$src = "site\content\experience"
$dest = "site\public\experience"

Get-ChildItem -Directory $src | ForEach-Object {
    $md = Join-Path $_.FullName "index.md"
    if (Test-Path $md) {
        $text = Get-Content $md -Raw
        $body = $text
        $title = $_.Name
        if ($text -match "(?s)---(.*?)---") {
            $fm = $matches[1]
            $body = $text.Substring($matches[0].Length).Trim()
            if ($fm -match 'title:\s*\"(.*?)\"') { $title = $matches[1] }
            elseif ($fm -match 'title:\s*(.*)') { $title = $matches[1].Trim(' \"') }
        }

        # Convert simple markdown paragraphs to HTML paragraphs (basic)
        $paragraphs = $body -split "\r?\n\r?\n" | ForEach-Object {
            $p = $_.Trim()
            if ($p -ne "") {"<p>" + ([System.Web.HttpUtility]::HtmlEncode($p)) + "</p>"} else {""}
        }
        $contentHtml = $paragraphs -join "`n"

        $html = "<!doctype html>`n<html lang='en'>`n<head>`n  <meta charset='utf-8'>`n  <meta name='viewport' content='width=device-width,initial-scale=1'>`n  <title>$([System.Web.HttpUtility]::HtmlEncode($title))</title>`n  <style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial;margin:0;color:#111}main{padding:2rem;max-width:900px;margin:0 auto}</style>`n</head>`n<body>`n<main>`n  <h1>$([System.Web.HttpUtility]::HtmlEncode($title))</h1>`n  $contentHtml`n</main>`n</body>`n</html>"

        $outDir = Join-Path $dest $_.Name
        New-Item -ItemType Directory -Force -Path $outDir | Out-Null
        Set-Content -Path (Join-Path $outDir "index.html") -Value $html -Encoding utf8
    }
}

Write-Output "Generated HTML for experience pages to $dest"